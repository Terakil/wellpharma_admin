const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuration Middleware
app.use(cors()); // Autorise les requêtes de Flutter
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la connexion MySQL (XAMPP par défaut)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Vide par défaut sur XAMPP
  database: 'pharmacie_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper pour gérer les erreurs asynchrones
function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

// --- API : AUTHENTIFICATION (LOGIN) ---
app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
  }

  const [users] = await pool.query(
    'SELECT * FROM utilisateurs WHERE email = ? AND motdepasse = ?',
    [email, password]
  );

  if (users.length > 0) {
    const user = users[0];
    res.json({
      success: true,
      role: user.role,
      message: 'Connexion réussie'
    });
  } else {
    res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  }
}));

// --- API : CRÉATION DE COMPTE (SIGNUP) ---
app.post('/api/signup', asyncHandler(async (req, res) => {
  const { nom, email, motdepasse } = req.body;

  if (!nom || !email || !motdepasse) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom, email, motdepasse, role) VALUES (?, ?, ?, "user")',
      [nom, email, motdepasse]
    );
    res.json({ success: true, message: 'Compte créé avec succès !' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    } else {
      throw error;
    }
  }
}));

// --- API : RÉCUPÉRER LE STOCK (PRODUITS) ---
app.get('/api/stock', asyncHandler(async (req, res) => {
  const [results] = await pool.query('SELECT * FROM produits');
  res.json(results);
}));

// --- API : RÉCUPÉRER L'HISTORIQUE D'ACHAT ---
app.get('/api/historique', asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requis' });
  }

  const [results] = await pool.query(
    'SELECT c.*, p.designation, p.image_url FROM commandes c JOIN produits p ON c.id_produit = p.id_produit WHERE c.acheteur = ? ORDER BY c.date DESC',
    [email]
  );
  res.json(results);
}));

// --- API : METTRE À JOUR LE STOCK APRÈS ACHAT ---
app.post('/api/commander', asyncHandler(async (req, res) => {
  const { items, email } = req.body; // Liste d'objets { designation, quantity }

  if (!items || !Array.isArray(items) || !email) {
    return res.status(400).json({ success: false, message: 'Données de commande invalides' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of items) {
      // 1. Récupérer les infos du produit
      const [rows] = await connection.query(
        'SELECT id_produit, quantite, prix_unitaire FROM produits WHERE designation = ?',
        [item.name]
      );

      if (rows.length === 0) throw new Error(`Produit non trouvé: ${item.name}`);

      const product = rows[0];
      if (product.quantite < item.quantity) {
        throw new Error(`Stock insuffisant pour ${item.name} (${product.quantite} disponibles)`);
      }

      // 2. Soustraire la quantité
      await connection.query(
        'UPDATE produits SET quantite = quantite - ? WHERE id_produit = ?',
        [item.quantity, product.id_produit]
      );

      // 3. Mettre à jour le statut si nécessaire
      await connection.query(
        "UPDATE produits SET statut = CASE WHEN quantite = 0 THEN 'RUPTURE' WHEN quantite < 10 THEN 'FAIBLE' ELSE 'EN STOCK' END WHERE id_produit = ?",
        [product.id_produit]
      );

      // 4. Enregistrer dans la table commandes (Historique)
      const prixTotal = product.prix_unitaire * item.quantity;
      await connection.query(
        'INSERT INTO commandes (id_produit, quantite, prix_total, acheteur) VALUES (?, ?, ?, ?)',
        [product.id_produit, item.quantity, prixTotal, email]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Commande validée, stock mis à jour et historique enregistré' });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur transaction commande:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
}));

// --- API : AJOUTER UN PRODUIT (ADMIN) ---
function generateReference(id) {
  return `REF-${id.toString().padStart(4, '0')}`;
}

app.post('/api/ajout', asyncHandler(async (req, res) => {
  const { designation, prix_unitaire, quantite, description, categorie, image_url } = req.body;

  if (!designation || !prix_unitaire || !quantite || !categorie) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  // 1. Insertion avec référence temporaire
  const tempRef = `TEMP-${Date.now()}`;
  const [result] = await pool.query(
    'INSERT INTO produits (designation, prix_unitaire, quantite, reference, description, categorie, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [designation, prix_unitaire, quantite, tempRef, description || '', categorie, image_url || null]
  );

  // 2. Génération et mise à jour de la référence réelle
  const realRef = generateReference(result.insertId);
  await pool.query('UPDATE produits SET reference = ? WHERE id_produit = ?', [realRef, result.insertId]);

  res.json({ success: true, message: `Produit ajouté (${realRef})`, reference: realRef });
}));

// --- GESTION D'ERREUR GLOBALE ---
app.use((err, req, res, next) => {
  console.error('Erreur Serveur:', err);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur', detail: err.message });
});

// --- LANCEMENT DU SERVEUR ---
app.listen(port, () => {
  console.log(`=========================================`);
  console.log(`🚀 Serveur WellPharma lancé sur le port ${port}`);
  console.log(`🔌 Connexion MySQL : localhost / pharmacie_db`);
  console.log(`📡 URL API : http://localhost:${port}/api`);
  console.log(`=========================================`);
});

// Capture des erreurs non gérées pour éviter le crash silencieux
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejet non géré à :', promise, 'raison :', reason);
});
