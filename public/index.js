// const socket = io();

// const canvas = document.getElementById('draw-area');
// const whoisDrawing = document.getElementById('whois-area');
// const toolPreview = document.getElementById('tool-preview');

// const ctx = canvas.getContext('2d');
// const whoisCtx = whoisDrawing.getContext('2d');
// const toolPreviewCtx = toolPreview.getContext('2d');

// let x = 0;
// let y = 0;
// let width = 1;
// let color = getRandomCSSColor();

// const colorPicker = document.getElementById('line-color');
// const sizePicker = document.getElementById('size-picker');

// colorPicker.value = color;
// sizePicker.value = width;

// colorPicker.addEventListener('change', (e) => {
//   color = e.target.value;
// });

// sizePicker.addEventListener('change', (e) => {
//   width = e.target.value;
//   document.getElementById('current-size').innerHTML = width;
// });

// let isDrawing = false;

// let drawingArray = [];

// window.addEventListener('mousedown', (e) => {
//   x = e.offsetX;
//   y = e.offsetY;
//   isDrawing = true;
//   drawingArray.push({ x: x, y: y });
// });

// window.addEventListener('mousemove', (e) => {
//   if (isDrawing === true) {
//     x = e.offsetX;
//     y = e.offsetY;
//     drawingArray.push({ x: e.offsetX, y: e.offsetY });
//   }
//   socket.emit('move', e.offsetX, e.offsetY);
// });

// window.addEventListener('mouseup', (e) => {
//   if (isDrawing === true) {
//     drawingArray.push({ x: e.offsetX, y: e.offsetY });
//     socket.emit('draw', width, color, drawingArray);
//     previousLines.add(new Line(drawingArray, width, 'pencil', color));
//     draw(drawingArray, width, color);
//     drawingArray = [];
//     x = 0;
//     y = 0;
//     isDrawing = false;
//   }
// });

// function draw(path, width, color) {
//   if (path.length < 2) return;
//   const pen = new Pen({ color, width });
//   pen.render(ctx, path);
//   let x = 0;
//   let y = 0;
//   ctx.moveTo(x, y);
//   ctx.beginPath();
//   ctx.strokeStyle = color;
//   ctx.lineWidth = width;
//   for (const point of path) {
//     ctx.lineTo(point.x, point.y);
//     x = point.x;
//     y = point.y;
//   }
//   ctx.stroke();
//   ctx.closePath();
// }

// function preview(fromx, fromy, tox, toy, width, color) {
//   toolPreviewCtx.beginPath();
//   toolPreviewCtx.strokeStyle = color;
//   toolPreviewCtx.lineWidth = width;
//   toolPreviewCtx.moveTo(fromx, fromy);
//   toolPreviewCtx.lineTo(tox, toy);
//   toolPreviewCtx.stroke();
//   toolPreviewCtx.closePath();
// }

// function getRandomCSSColor() {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }

// function renderLayers() {
//   whoisCtx.clearRect(0, 0, whoisDrawing.width, whoisDrawing.height);
//   users.forEach((user, id) => {
//     whoisCtx.font = '10px Arial';
//     whoisCtx.fillStyle = user.color;
//     whoisCtx.fillText(user.name, user.x, user.y);
//   });

//   // render preview
//   toolPreviewCtx.clearRect(0, 0, toolPreview.width, toolPreview.height);
//   if (drawingArray.length > 1) {
//     let x = drawingArray[0].x;
//     let y = drawingArray[0].y;
//     for (let i = 1; i < drawingArray.length; i++) {
//       const point = drawingArray[i];
//       preview(x, y, point.x, point.y, width, color);
//       x = point.x;
//       y = point.y;
//     }
//   }

//   requestAnimationFrame(renderLayers);
// }

// renderLayers();
