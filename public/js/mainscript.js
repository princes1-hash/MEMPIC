 var tl = gsap.timeline({ paused: true });
        var menuTrigger = document.querySelector(".menu");
        var closeTrigger = document.querySelector(".cross");

        tl.to(".sideBar", {
            right: 0,
            duration: 0.4,
            ease: "power2.out"
        })
        .from(".linkk a", {
            x: 40,
            opacity: 0,
            duration: 0.3,
            stagger: 0.08,
            ease: "power2.out"
        }, "-=0.2")
        .from(".cross", {
            opacity: 0,
            duration: 0.2
        }, "-=0.1");

        menuTrigger.addEventListener("click", function() {
            tl.play();
        });
        
        closeTrigger.addEventListener("click", function() {
            tl.reverse();
        });


        function executeFormatFilter(eventId, type, label, element) {
    const container = document.getElementById(`format-${eventId}`);
    
    container.querySelector('.format-label-text').innerText = label;
    
    container.setAttribute('data-open', 'false');
        const section = container.closest('.event-subsection');
    if (!section) return;
    const mediaItems = section.querySelectorAll('.grid > div');
    
    mediaItems.forEach(item => {
        const hasVideo = item.querySelector('video') !== null;
        const hasImage = item.querySelector('img') !== null;

        if (type === 'all') {
            item.classList.remove('hidden');
        } else if (type === 'video') {
            hasVideo ? item.classList.remove('hidden') : item.classList.add('hidden');
        } else if (type === 'image') {
            hasImage ? item.classList.remove('hidden') : item.classList.add('hidden');
        }
    });
}


async function toggleLike(mediaId, buttonElement, event) {
    if (event) event.stopPropagation();

    try {
        const response = await fetch(`/comments/media/${mediaId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            const icon = buttonElement.querySelector('i');
            const countSpan = buttonElement.querySelector('.like-count');

            countSpan.textContent = data.count;

            if (data.liked) {
                icon.className = 'ri-heart-3-fill text-rose-500 text-lg';
                buttonElement.setAttribute('data-liked', 'true');
            } else {
                icon.className = 'ri-heart-3-line text-lg group-hover/like:scale-110 transition-transform';
                buttonElement.setAttribute('data-liked', 'false');
            }
        } else {
            console.error("Failed to process like status updates:", data.message);
        }
    } catch (err) {
        console.error("Network interface error updating asset interactions:", err);
    }

}


document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-format-menu')) {
        document.querySelectorAll('.custom-format-menu').forEach(m => m.setAttribute('data-open', 'false'));
    }
});

function toggleMainDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('mainDropdownMenu');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        setTimeout(() => menu.classList.remove('opacity-0'), 10);
    } else {
        closeAllDropdowns();
    }
}

function toggleSubAccordion(accordionId, chevronId, event) {
    event.stopPropagation();
    const targetAccordion = document.getElementById(accordionId);
    const targetChevron = document.getElementById(chevronId);
    const isOpened = targetAccordion.style.maxHeight && targetAccordion.style.maxHeight !== '0px';

    document.getElementById('clubAccordion').style.maxHeight = '0px';
    document.getElementById('clubChevron').classList.remove('rotate-180');

    if (!isOpened) {
        targetAccordion.style.maxHeight = '200px';
        targetChevron.classList.add('rotate-180');
    }
}

function closeAllDropdowns() {
    const menu = document.getElementById('mainDropdownMenu');
    if (!menu) return;
    menu.classList.add('opacity-0');
    setTimeout(() => {
        menu.classList.add('hidden');
        document.getElementById('clubAccordion').style.maxHeight = '0px';
        document.getElementById('clubChevron').classList.remove('rotate-180');
    }, 200);
}

//engine-1
function executeMenuSort(criterion, filterTargetValue) {
    const container = document.getElementById('vaultFoldersContainer');
    if (!container || criterion !== 'club') return;

    const sections = Array.from(container.querySelectorAll('.club-section'));

    sections.sort((sectionA, sectionB) => {
        const clubA = sectionA.getAttribute('data-club') || '';
        const clubB = sectionB.getAttribute('data-club') || '';

        if (clubA === filterTargetValue && clubB !== filterTargetValue) return -1;
        if (clubB === filterTargetValue && clubA !== filterTargetValue) return 1;

        return clubA.localeCompare(clubB);
    });

    closeAllDropdowns();

    sections.forEach(sec => {
        if (sec.getAttribute('data-club') === filterTargetValue) {
            sec.classList.add('ring-2', 'ring-gray-400', 'shadow-md');
            setTimeout(() => sec.classList.remove('ring-2', 'ring-gray-400'), 500);
        }
        container.appendChild(sec);
    });
}

//engine-2
function executeLocalCategorySort(clubBlockId, selectedCategory) {
    const wrapper = document.getElementById(`events-wrapper-${clubBlockId}`);
    if (!wrapper) return;

    const events = Array.from(wrapper.querySelectorAll('.event-subsection'));

    events.sort((eventA, eventB) => {
        const catA = eventA.getAttribute('data-category') || '';
        const catB = eventB.getAttribute('data-category') || '';

        if (selectedCategory === 'default') return 0; 

        if (catA === selectedCategory && catB !== selectedCategory) return -1;
        if (catB === selectedCategory && catA !== selectedCategory) return 1;

        return catA.localeCompare(catB);
    });

    events.forEach(ev => {
        const currentCat = ev.getAttribute('data-category') || '';
        if (selectedCategory !== 'default' && currentCat === selectedCategory) {
            ev.classList.add('bg-slate-50/50', 'p-4', 'rounded-2xl', 'border', 'border-gray-100');
            setTimeout(() => ev.classList.remove('bg-slate-50/50', 'p-4', 'rounded-2xl', 'border', 'border-gray-100'), 1500);
        }
        wrapper.appendChild(ev);
    });
}
document.addEventListener('click', () => closeAllDropdowns());

function toggleMenu(id, event) {
    event.stopPropagation();
    const el = document.getElementById(`menu-${id}`);
    const isOpen = el.getAttribute('data-open') === 'true';
    
    document.querySelectorAll('.custom-select-menu').forEach(m => m.setAttribute('data-open', 'false')); // Close all others
    el.setAttribute('data-open', isOpen ? 'false' : 'true');
}

function selectOption(id, value, label) {
    document.getElementById(`menu-${id}`).querySelector('.label-text').innerText = label;
    document.getElementById(`menu-${id}`).setAttribute('data-open', 'false');
    executeLocalCategorySort(id, value); 
}

document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-menu').forEach(m => m.setAttribute('data-open', 'false'));
});



