-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 09 sep. 2026 à 14:30
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pharmacie_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin_profile`
--

CREATE TABLE `admin_profile` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `alertes`
--

CREATE TABLE `alertes` (
  `id_alerte` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `type_alerte` enum('Stock faible','Rupture') NOT NULL,
  `message` varchar(255) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id_commande` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `quantite` int(11) NOT NULL CHECK (`quantite` > 0),
  `prix_total` decimal(15,2) NOT NULL,
  `acheteur` varchar(100) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id_commande`, `id_produit`, `quantite`, `prix_total`, `acheteur`, `date`) VALUES
(1, 1, 3, 1500.00, 'a@gmail.com', '2026-09-08 20:32:03'),
(2, 5, 1, 3000.00, 'a@gmail.com', '2026-09-08 20:33:22'),
(3, 2, 1, 2000.00, 'a@gmail.com', '2026-09-08 20:38:08'),
(4, 1, 1, 500.00, 'a@gmail.com', '2026-09-08 20:38:21'),
(5, 1, 1, 500.00, 'a@gmail.com', '2026-09-08 20:39:19'),
(6, 8, 4, 48888.00, 'a@gmail.com', '2026-09-09 12:08:03'),
(7, 8, 1, 12222.00, 'a@gmail.com', '2026-09-09 12:12:32');

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

CREATE TABLE `fournisseurs` (
  `id` int(10) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `ville` varchar(50) NOT NULL,
  `personneContact` varchar(50) NOT NULL,
  `tel` varchar(15) DEFAULT NULL,
  `LastCommand` date NOT NULL,
  `DateArrive` date NOT NULL,
  `MedicamentFourni` varchar(50) NOT NULL,
  `delaiLivraison` int(11) NOT NULL,
  `montant` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `historique`
--

CREATE TABLE `historique` (
  `id_historique` int(11) NOT NULL,
  `action` enum('Ajout','Suppression','Mise à jour') NOT NULL,
  `produit` varchar(255) NOT NULL,
  `utilisateur` varchar(100) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `medicines`
--

CREATE TABLE `medicines` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` float NOT NULL,
  `quantity` int(11) NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `supplier` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `medicines`
--

INSERT INTO `medicines` (`id`, `name`, `category`, `price`, `quantity`, `expiration_date`, `supplier`, `description`, `image`, `created_at`) VALUES
(1, 'Chlore', 'Autre', 2444, 122, '2030-12-03', 'Ter', 'chlore', 'https://cdn.manomano.com/images/images_products/15493228/P/151589371_1.jpg', '2026-09-09 11:40:42');

-- --------------------------------------------------------

--
-- Structure de la table `medicine_info`
--

CREATE TABLE `medicine_info` (
  `id` int(11) NOT NULL,
  `medicine_id` int(11) NOT NULL,
  `requires_prescription` tinyint(1) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `medicine_info`
--

INSERT INTO `medicine_info` (`id`, `medicine_id`, `requires_prescription`, `image_url`, `created_at`) VALUES
(1, 1, 0, 'https://cdn.manomano.com/images/images_products/15493228/P/151589371_1.jpg', '2026-09-09 11:40:42');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id_produit` int(11) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `quantite` int(11) NOT NULL CHECK (`quantite` >= 0),
  `prix_unitaire` decimal(10,2) NOT NULL CHECK (`prix_unitaire` >= 0),
  `statut` enum('EN STOCK','FAIBLE','RUPTURE') DEFAULT 'EN STOCK',
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `needs_prescription` tinyint(1) NOT NULL DEFAULT 0,
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id_produit`, `designation`, `reference`, `categorie`, `quantite`, `prix_unitaire`, `statut`, `description`, `image_url`, `needs_prescription`, `date_ajout`) VALUES
(1, 'Paracétamol', 'REF-PARA-01', 'Antalgique', 115, 500.00, 'EN STOCK', 'Contre la douleur et la fièvre.', 'https://delmar-test.linkedgates.com/images/items/130181-v1.JPEG', 0, '2026-09-08 17:22:39'),
(2, 'Doliprane 1000mg', 'REF-DOLI-01', 'Antalgique', 79, 2000.00, 'EN STOCK', 'Paracétamol fortement dosé.', 'https://www.mon-pharmacien-conseil.com/13833-large_default/doliprane-tabs-1000-mg-8-film-coated-tablets.avif', 0, '2026-09-08 17:22:39'),
(3, 'Amoxicilline', 'REF-AMOX-01', 'Antibiotique', 45, 1500.00, 'FAIBLE', 'Antibiotique large spectre.', 'https://pictures.laprovence.com/cdn-cgi/image/width=1200,quality=80,format=auto,trim.left=0,trim.top=261,trim.height=1003,trim.width=1791/media/hermes/20221215/20221215_1_6_1_1_0_obj27295507_1.jpg', 1, '2026-09-08 17:22:39'),
(4, 'Toplexil', 'REF-SIRO-01', 'Antitussif', 30, 7500.00, 'FAIBLE', 'Calme la toux sèche.', 'https://www.toplexil.fr/assets/images/toplexil_sanssucre.jpg', 0, '2026-09-08 17:22:39'),
(5, 'Vitamine C 500mg', 'REF-VITA-01', 'Vitamines', 199, 3000.00, 'EN STOCK', 'Renforce le système immunitaire.', 'https://pharmaciedutransvaal.pharminfo.fr/static/thumbnail/images/cip/3400935668486/3566848-VITAMINEC-EXO-500MG-30CP.png', 0, '2026-09-08 17:22:39'),
(6, 'Co-Artesiane', 'REF-Palu-01', 'Antipaludique', 10, 12000.00, 'RUPTURE', 'Traitement contre le paludisme.', 'https://www.dafrapharma.com/wp-content/uploads/2021/08/3COARTS180C2FRLR-2.jpg', 1, '2026-09-08 17:22:39'),
(7, 'Augmentin 1g', 'REF-AUG-01', 'Antibiotique', 50, 45000.00, 'EN STOCK', 'Amoxicilline + Acide Clavulanique.', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Augmentin_1_g_tbl.jpg/960px-Augmentin_1_g_tbl.jpg?utm_source=fr.wiktionary.org&utm_campaign=index&utm_content=thumbnail', 1, '2026-09-08 17:22:39'),
(8, 'Chlore', 'REF-CHLORE-091505', 'Autre', 117, 12222.00, 'EN STOCK', 'chlore', 'https://cdn.manomano.com/images/images_products/15493228/P/151589371_1.jpg', 0, '2026-09-09 09:05:22');

-- --------------------------------------------------------

--
-- Structure de la table `rapports`
--

CREATE TABLE `rapports` (
  `id` varchar(50) NOT NULL,
  `type` int(11) NOT NULL,
  `periode` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_globales`
--

CREATE TABLE `stats_globales` (
  `id_stat` int(11) NOT NULL,
  `total_references` int(11) DEFAULT NULL,
  `valeur_stock` decimal(15,2) DEFAULT NULL,
  `alertes_stock` int(11) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `medicine_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `city` varchar(100) NOT NULL,
  `contact` varchar(150) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `medicines` text DEFAULT NULL,
  `last_order` varchar(20) DEFAULT NULL,
  `arrival_date` varchar(20) DEFAULT NULL,
  `delivery_delay` int(11) DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id_utilisateur` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `role` enum('admin','user','pharmacien','docteur') NOT NULL DEFAULT 'user',
  `email` varchar(150) NOT NULL,
  `motdepasse` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `nom`, `role`, `email`, `motdepasse`) VALUES
(1, 'Pharmacien Chef', 'admin', 'admin@wellpharma.com', 'admin123'),
(2, 'Client Test', 'user', 'client@test.com', 'user123'),
(3, 'aro', 'user', 'a@gmail.com', '1111');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin_profile`
--
ALTER TABLE `admin_profile`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `alertes`
--
ALTER TABLE `alertes`
  ADD PRIMARY KEY (`id_alerte`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id_commande`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `historique`
--
ALTER TABLE `historique`
  ADD PRIMARY KEY (`id_historique`);

--
-- Index pour la table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `medicine_info`
--
ALTER TABLE `medicine_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `medicine_id` (`medicine_id`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id_produit`),
  ADD UNIQUE KEY `reference` (`reference`);

--
-- Index pour la table `rapports`
--
ALTER TABLE `rapports`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `stats_globales`
--
ALTER TABLE `stats_globales`
  ADD PRIMARY KEY (`id_stat`);

--
-- Index pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medicine_id` (`medicine_id`);

--
-- Index pour la table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `admin_profile`
--
ALTER TABLE `admin_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `alertes`
--
ALTER TABLE `alertes`
  MODIFY `id_alerte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id_commande` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `historique`
--
ALTER TABLE `historique`
  MODIFY `id_historique` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `medicines`
--
ALTER TABLE `medicines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `medicine_info`
--
ALTER TABLE `medicine_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `stats_globales`
--
ALTER TABLE `stats_globales`
  MODIFY `id_stat` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `alertes`
--
ALTER TABLE `alertes`
  ADD CONSTRAINT `alertes_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id_produit`);

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id_produit`);

--
-- Contraintes pour la table `medicine_info`
--
ALTER TABLE `medicine_info`
  ADD CONSTRAINT `medicine_info_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`);

--
-- Contraintes pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
