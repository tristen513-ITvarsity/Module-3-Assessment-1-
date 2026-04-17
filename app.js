const wardrobeConfig = {
    hair: ['hair_01.png', 'hair_02.png', 'hair_03.png', 'hair_04.png', 'hair_05.png', 'hair_06.png', 'hair_07.png'],
    eyes: ['eyes_01.png', 'eyes_02.png', 'eyes_03.png', 'eyes_04.png', 'eyes_05.png', 'eyes_06.png', 'eyes_07.png', 'eyes_08.png'],
    mouth: ['mouth_01.png', 'mouth_02.png', 'mouth_03.png', 'mouth_04.png', 'mouth_05.png', 'mouth_06.png', 'mouth_07.png', 'mouth_08.png'],
    shirt: ['shirt_01.png', 'shirt_02.png', 'shirt_03.png', 'shirt_04.png', 'shirt_05.png'],
    pants: ['pants_01.png', 'pants_02.png', 'pants_03.png', 'pants_04.png', 'pants_05.png'],
    glasses: ['glasses_01.png', 'glasses_02.png', 'glasses_03.png', 'glasses_04.png', 'glasses_05.png'],
    hat: ['hat_01.png', 'hat_02.png', 'hat_03.png', 'hat_04.png', 'hat_05.png'],
    facehair: ['face-hair_01.png', 'face-hair_02.png', 'face-hair_03.png', 'face-hair_04.png', 'face-hair_05.png'],
    shoes: [
        { label: 'shoe_01', left: 'shoe_01_L.png', right: 'shoe_01_R.png' },
        { label: 'shoe_02', left: 'shoe_02_L.png', right: 'shoe_02_R.png' }
    ]
};

const state = {
    hair: null,
    eyes: null,
    mouth: null,
    shirt: null,
    pants: null,
    glasses: null,
    hat: null,
    facehair: null,
    shoes: null
};

const statusMessage = document.getElementById('status-message');
const resetButton = document.getElementById('reset-button');
const dropZones = document.querySelectorAll('.drop-zone');
let activeItem = null;

function titleFromName(fileName) {
    return fileName
        .replace('.png', '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createWardrobeItem(category, fileData) {
    const item = document.createElement('button');
    const image = document.createElement('img');
    const isShoeSet = category === 'shoes';

    item.type = 'button';
    item.className = 'wardrobe-item';
    item.draggable = true;
    item.dataset.category = category;

    if (isShoeSet) {
        item.dataset.pair = JSON.stringify(fileData);
        image.src = fileData.left;
        image.alt = titleFromName(fileData.label);
    } else {
        item.dataset.file = fileData;
        image.src = fileData;
        image.alt = titleFromName(fileData);
    }

    item.appendChild(image);

    item.addEventListener('dragstart', (event) => {
        activeItem = {
            category,
            file: item.dataset.file || null,
            pair: item.dataset.pair || null
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(activeItem));
        event.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        activeItem = null;
        item.classList.remove('dragging');
        dropZones.forEach((zone) => zone.classList.remove('active'));
    });

    return item;
}

function fillWardrobe() {
    Object.entries(wardrobeConfig).forEach(([category, files]) => {
        const row = document.querySelector(`[data-category="${category}"]`);
        if (!row) {
            return;
        }

        files.forEach((fileData) => {
            row.appendChild(createWardrobeItem(category, fileData));
        });
    });
}

function renderSingle(slotId, fileName, extraClass) {
    const slot = document.getElementById(slotId);
    const image = document.createElement('img');

    slot.innerHTML = '';
    image.src = fileName;
    image.alt = '';
    if (extraClass) {
        image.className = extraClass;
    }
    slot.appendChild(image);
}

function renderShoes(pairJson) {
    const slot = document.getElementById('slot-shoes');
    const pair = JSON.parse(pairJson);
    const leftShoe = document.createElement('img');
    const rightShoe = document.createElement('img');

    slot.innerHTML = '';

    leftShoe.src = pair.left;
    leftShoe.alt = '';
    leftShoe.className = 'left-shoe';

    rightShoe.src = pair.right;
    rightShoe.alt = '';
    rightShoe.className = 'right-shoe';

    slot.append(leftShoe, rightShoe);
}

function updateStatus(message) {
    statusMessage.textContent = message;
}

function handleDrop(category, payload) {
    if (category === 'shoes') {
        renderShoes(payload.pair);
        state.shoes = payload.pair;
        updateStatus('Shoes added to your funny person.');
        return;
    }

    renderSingle(`slot-${category}`, payload.file);
    state[category] = payload.file;
    updateStatus(`${titleFromName(payload.file)} added.`);
}

function setupDropZones() {
    dropZones.forEach((zone) => {
        zone.addEventListener('dragover', (event) => {
            if (!activeItem) {
                return;
            }

            if (activeItem.category === zone.dataset.category) {
                event.preventDefault();
                zone.classList.add('active');
            }
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('active');
        });

        zone.addEventListener('drop', (event) => {
            let payload;

            event.preventDefault();
            zone.classList.remove('active');

            try {
                payload = activeItem || JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (error) {
                updateStatus('That item could not be dropped. Try again.');
                return;
            }

            if (!payload || payload.category !== zone.dataset.category) {
                updateStatus('Drop the item on the matching body area.');
                return;
            }

            handleDrop(payload.category, payload);
        });
    });
}

resetButton.addEventListener('click', () => {
    Object.keys(state).forEach((key) => {
        state[key] = null;
        const slot = document.getElementById(`slot-${key}`);
        if (slot) {
            slot.innerHTML = '';
        }
    });

    updateStatus('Character cleared. Drag new items onto the stickman.');
});

fillWardrobe();
setupDropZones();
