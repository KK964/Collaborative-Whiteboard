function makeDraggable(element) {
  let x = 0;
  let y = 0;
  let isDrawing = false;

  console.log(element);
  const drag = element.querySelector('[data-drag-bar]') ?? element;

  drag.onmousedown = dragMouseDown;
  window.onmouseup = dragMouseUp;
  window.onmousemove = dragMouseMove;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    console.log('dragMouseDown');
    x = e.clientX;
    y = e.clientY;
    isDrawing = true;
  }

  function dragMouseUp(e) {
    if (!isDrawing) return;
    e = e || window.event;
    e.preventDefault();
    x = 0;
    y = 0;
    isDrawing = false;
  }

  function dragMouseMove(e) {
    if (!isDrawing) return;
    e = e || window.event;
    e.preventDefault();
    if (!isDrawing) {
      return;
    }

    const xDiff = e.clientX - x;
    const yDiff = e.clientY - y;

    x = e.clientX;
    y = e.clientY;

    element.style.top = `${element.offsetTop + yDiff}px`;
    element.style.left = `${element.offsetLeft + xDiff}px`;
  }
}

for (const element of document.querySelectorAll('[data-draggable]')) {
  makeDraggable(element);
}
