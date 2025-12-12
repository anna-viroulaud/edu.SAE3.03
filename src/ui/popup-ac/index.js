// Charger les données du fichier tree.json
let treeData = null;

// Fonction pour charger les données
async function loadTreeData() {
    try {
        const response = await fetch('../data/tree.json');
        const data = await response.json();
        treeData = data[0];
        console.log('Données chargées avec succès', treeData);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

// Charger les données au démarrage
loadTreeData();

// Fonction pour ouvrir la popup avec les données d'un AC
function openACPopup(acCode) {
    if (!treeData) {
        console.error('Les données ne sont pas encore chargées');
        return;
    }

    let acData = null;
    let competenceName = '';
    let competenceLong = '';
    let niveauLibelle = '';
    let annee = '';
    let couleur = '';

    // Parcourir les compétences pour trouver l'AC
    for (const competenceId in treeData) {
        const competence = treeData[competenceId];

        for (const niveau of competence.niveaux) {
            const foundAc = niveau.acs.find(ac => ac.code === acCode);
            if (foundAc) {
                acData = foundAc;
                competenceName = competence.nom_court;
                competenceLong = competence.libelle_long;
                niveauLibelle = niveau.libelle;
                annee = niveau.annee;
                couleur = competence.couleur;
                break;
            }
        }
        if (acData) break;
    }

    if (!acData) {
        console.error('AC non trouvé:', acCode);
        return;
    }

    // Remplir la popup avec les données
    document.getElementById('popupCode').textContent = acData.code;
    document.getElementById('popupTitle').textContent = acData.libelle;
    document.getElementById('popupAnnee').textContent = annee;
    document.getElementById('popupCompetence').textContent = competenceName;
    document.getElementById('popupLibelle').textContent = acData.libelle;
    document.getElementById('popupNiveau').textContent = niveauLibelle;
    document.getElementById('popupCompetenceLong').textContent = competenceLong;

    // Changer la couleur du header en fonction de la compétence
    const header = document.querySelector('.popup-header');
    if (header) {
        header.style.background = getCompetenceGradient(couleur);
    }

    // Afficher la popup
    const popup = document.getElementById('acPopup');
    popup.classList.add('active');
}

// Fonction pour obtenir le gradient en fonction de la couleur de la compétence
function getCompetenceGradient(couleur) {
    const gradients = {
        'c1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'c2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'c3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'c4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'c5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[couleur] || gradients['c1'];
}

// Fonction pour fermer la popup
function closePopup() {
    const popup = document.getElementById('acPopup');
    popup.classList.remove('active');
}

// Initialiser les événements au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Événement pour le bouton de fermeture
    const closeBtn = document.getElementById('closePopupBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Fermer la popup si on clique en dehors
    const popup = document.getElementById('acPopup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup();
            }
        });
    }

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });

    // Ajouter des événements de clic sur tous les éléments AC
    // Cette partie sera à adapter selon votre structure HTML existante
    const acElements = document.querySelectorAll('[data-ac-code]');
    
    acElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', function() {
            const acCode = this.getAttribute('data-ac-code');
            if (acCode) {
                openACPopup(acCode);
            }
        });
    });
});

// Exporter la fonction pour pouvoir l'appeler depuis d'autres scripts
window.openACPopup = openACPopup;
