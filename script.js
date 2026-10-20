// ==========================================================================
// HOT WHEELS HUB - JAVASCRIPT INTERATTIVO
// Gestione ricerca tempo reale, filtri categorie e copia link con Toast
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const filterPills = document.querySelectorAll('.filter-pills .pill');
  const categoryBlocks = document.querySelectorAll('.category-block');
  const linkCards = document.querySelectorAll('.link-card');
  const noResults = document.getElementById('noResults');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const totalCountEl = document.getElementById('totalLinksCount');
  const toast = document.getElementById('toast');

  let activeCategory = 'all';
  let searchTerm = '';
  let toastTimer = null;

  // Mostra/nasconde il tasto per cancellare il testo
  function updateClearButton() {
    if (searchInput.value.trim().length > 0) {
      clearSearchBtn.classList.add('visible');
    } else {
      clearSearchBtn.classList.remove('visible');
    }
  }

  // Funzione filtro combinato (Categoria + Ricerca)
  function applyFilters() {
    const term = searchTerm.toLowerCase().trim();
    let visibleTotal = 0;

    categoryBlocks.forEach((block) => {
      const blockCat = block.getAttribute('data-category');
      const categoryMatches = activeCategory === 'all' || activeCategory === blockCat;

      let visibleInBlock = 0;
      const cards = block.querySelectorAll('.link-card');

      cards.forEach((card) => {
        const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
        const domain = card.querySelector('.card-domain')?.textContent.toLowerCase() || '';
        const keywords = card.getAttribute('data-keywords')?.toLowerCase() || '';

        const fullText = `${title} ${desc} ${domain} ${keywords}`;
        const searchMatches = term === '' || fullText.includes(term);

        if (categoryMatches && searchMatches) {
          card.classList.remove('hidden');
          visibleInBlock++;
          visibleTotal++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Se non ci sono card visibili nel blocco o la categoria è filtrata via, nascondi il blocco
      if (categoryMatches && visibleInBlock > 0) {
        block.classList.remove('hidden');
      } else {
        block.classList.add('hidden');
      }
    });

    // Gestione stato "Nessun risultato"
    if (visibleTotal === 0) {
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
    }

    // Aggiorna conteggio visibile
    if (totalCountEl) {
      totalCountEl.textContent = visibleTotal;
    }
  }

  // Event listener per la ricerca
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    updateClearButton();
    applyFilters();
  });

  // Tasto reset nella casella di input
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    updateClearButton();
    searchInput.focus();
    applyFilters();
  });

  // Pulsante di reset dentro "Nessun risultato"
  resetSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    activeCategory = 'all';

    filterPills.forEach((p) => p.classList.remove('active'));
    const allPill = document.querySelector('.filter-pills [data-category="all"]');
    if (allPill) allPill.classList.add('active');

    updateClearButton();
    applyFilters();
  });

  // Event listener per i filtri a pillola
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      applyFilters();
    });
  });

  // Mostra toast di feedback
  function showToast(message = 'Link copiato negli appunti!') {
    if (!toast) return;
    const textSpan = toast.querySelector('span');
    if (textSpan) textSpan.textContent = message;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Gestione pulsante Copia Link
  document.querySelectorAll('.btn-copy').forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = button.getAttribute('data-url');
      if (!url) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          // Fallback legacy
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        // Effetto grafico temporaneo sul bottone
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
          button.style.transform = '';
        }, 150);

        showToast('Link copiato negli appunti!');
      } catch (err) {
        console.error('Errore durante la copia del link:', err);
        showToast('Impossibile copiare il link.');
      }
    });
  });

  // Scorciatoia da tastiera: '/' o 'Cmd+K' per cercare al volo
  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      searchTerm = '';
      updateClearButton();
      searchInput.blur();
      applyFilters();
    }
  });
});
