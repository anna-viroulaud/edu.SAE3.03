📘 Guide de Référence : HTML Sémantique, CSS & Méthode BEM

Ce document regroupe les standards professionnels pour structurer vos projets web de manière propre, évolutive et accessible.
1. Le HTML Sémantique

Le HTML sémantique consiste à utiliser des balises qui décrivent leur rôle plutôt que leur apparence.
Balise	Rôle
<header>	En-tête de la page ou d'un composant (logo, titre).
<nav>	Liens de navigation principaux.
<main>	Contenu principal unique du document.
<section>	Un regroupement thématique de contenu.
<article>	Un contenu autonome (ex: une carte produit, un post de blog).
<aside>	Contenu indirectement lié (barre latérale, pub).
<footer>	Pied de page (copyright, mentions légales).
2. La Méthodologie BEM

BEM signifie Block, Element, Modifier. C'est une convention de nommage qui évite les conflits de styles.

    Block (.card) : Le composant parent autonome.

    Element (.card__title) : Une partie interne du bloc, reliée par deux underscores __.

    Modifier (.card--blue) : Une variante ou un état, relié par deux tirets --.

Exemple :
HTML

<article class="card card--featured">
  <h2 class="card__title">Titre du produit</h2>
  <button class="card__button">Acheter</button>
</article>

3. L'Ordre des Propriétés dans une Classe

Pour garder un code organisé, on range les propriétés CSS de l'extérieur vers l'intérieur (modèle "Concentric").
📋 Checklist de l'ordre standard :

    Positionnement : Où se place l'élément dans le flux ?

        position, z-index, top/right/bottom/left, float.

    Modèle de Boîte & Layout : Quelle place prend-il ?

        display, flex-direction, grid-template, gap, width, height, margin, padding, border.

    Typographie : Comment se lit le texte ?

        color, font-family, font-size, font-weight, line-height, text-align.

    Visuel (Cosmétique) : À quoi ressemble-t-il ?

        background, border-radius, box-shadow, opacity.

    Divers :

        cursor, transition, transform, animation.

4. Exemple Pratique Complet
Structure HTML (BEM + Sémantique)
HTML

<main>
  <section class="container">
    <article class="product-card product-card--active">
      <header class="product-card__header">
        <h2 class="product-card__title">Casque Audio</h2>
      </header>
      <p class="product-card__desc">Son haute fidélité.</p>
      <button class="product-card__btn">Ajouter au panier</button>
    </article>
  </section>
</main>

Style CSS (Ordre des propriétés)
CSS

.product-card {
    /* 1. Positionnement */
    position: relative;

    /* 2. Layout & Box Model */
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 20px;
    border: 1px solid #ddd;

    /* 3. Typographie */
    font-family: sans-serif;
    color: #333;
    text-align: center;

    /* 4. Visuel */
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);

    /* 5. Divers */
    transition: transform 0.2s;
}

/* Modifier */
.product-card--active {
    border-color: blue;
}

/* Element */
.product-card__title {
    margin-bottom: 10px;
    font-size: 1.5rem;
    color: blue;
}