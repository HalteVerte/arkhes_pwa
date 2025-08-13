/**
 * Enregistrement du Service Worker avec gestion des mises à jour
 */

// Vérifie la compatibilité du navigateur
if ('serviceWorker' in navigator) {
  // Délai pour éviter de surcharger le réseau au chargement initial
  window.addEventListener('load', () => {
    // Configuration du Service Worker
    const swConfig = {
      updateViaCache: 'none',
      scope: '/'
    };

    // Enregistrement du Service Worker
    navigator.serviceWorker.register('/sw.js', swConfig)
      .then((registration) => {
        console.log('[Service Worker] Enregistré avec succès:', registration.scope);

        // Vérification des mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[Service Worker] Mise à jour détectée');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                console.log('[Service Worker] Nouvelle version disponible');
                showUpdateUI(registration);
              } else {
                // Premier chargement, SW activé
                console.log('[Service Worker] Prêt pour une utilisation hors-ligne');
              }
            }
          });
        });

        // Vérification périodique des mises à jour (toutes les 24h)
        setInterval(() => {
          registration.update()
            .then(() => console.log('[Service Worker] Vérification des mises à jour'))
            .catch(err => console.log('[Service Worker] Échec de la vérification:', err));
        }, 24 * 60 * 60 * 1000);
      })
      .catch((error) => {
        console.log('[Service Worker] Échec de l\'enregistrement:', error);
      });
  });

  // Gestion des messages entre SW et page
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

/**
 * Affiche une UI pour informer l'utilisateur d'une mise à jour disponible
 */
function showUpdateUI(registration) {
  // Crée une notification discrète (à personnaliser selon votre UI)
  const updateBanner = document.createElement('div');
  updateBanner.style.position = 'fixed';
  updateBanner.style.bottom = '20px';
  updateBanner.style.right = '20px';
  updateBanner.style.backgroundColor = '#A4D65E';
  updateBanner.style.color = 'white';
  updateBanner.style.padding = '15px';
  updateBanner.style.borderRadius = '5px';
  updateBanner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  updateBanner.style.zIndex = '1000';
  updateBanner.style.display = 'flex';
  updateBanner.style.gap = '10px';
  updateBanner.style.alignItems = 'center';
  
  updateBanner.innerHTML = `
    <span>Une nouvelle version est disponible !</span>
    <button id="sw-update-btn" style="
      background: white;
      color: #4B2E83;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    ">Actualiser</button>
  `;
  
  document.body.appendChild(updateBanner);
  
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    // Envoie un message au SW pour forcer l'activation
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    updateBanner.remove();
  });
  
  // Ferme automatiquement après 30s
  setTimeout(() => {
    if (document.body.contains(updateBanner)) {
      updateBanner.remove();
    }
  }, 30000);
}