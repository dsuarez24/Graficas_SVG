class SVGGraph {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.svg = this.createSVGElement('svg', { width: this.width, height: this.height });
    }

    createSVGElement(tag, attrs) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let attr in attrs) {
            element.setAttribute(attr, attrs[attr]);
        }
        return element;
    }

    rect(x, y, width, height, attrs = {}) {
        const rect = this.createSVGElement('rect', { x, y, width, height, ...attrs });
        rect.addEventListener('mouseover', () => {
            rect.setAttribute('fill', '#f1c40f');  // Cambia color en hover
        });
        rect.addEventListener('mouseout', () => {
            rect.setAttribute('fill', attrs.fill);  // Restaura el color
        });
        this.svg.appendChild(rect);
    }

    text(content, x, y, attrs = {}) {
        const text = this.createSVGElement('text', { x, y, ...attrs });
        text.textContent = content;
        this.svg.appendChild(text);
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';  // Limpiar el contenedor antes de agregar el nuevo SVG
        container.appendChild(this.svg);
    }

    // Gráfica de barras
    drawBarChart(data, options = {}) {
        const colors = options.colors || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#8e44ad'];
        const maxValue = Math.max(...data.map(d => d.valor));
        const barWidth = (this.width / data.length) * 0.8;  // Hacer las barras más anchas
        const barSpacing = 5;  // Reducir el espaciado entre barras

        data.forEach((item, index) => {
            const barHeight = (item.valor / maxValue) * (this.height - 50);  // Ajustar la altura de las barras
            const x = index * (barWidth + barSpacing);
            const y = this.height - barHeight - 30;  // Ajuste vertical

            this.rect(x, y, barWidth - barSpacing, barHeight, { fill: colors[index % colors.length] });

            // Añadir etiquetas
            this.text(item.nombre_pais, x + 5, this.height - 5, { fill: '#000' });
            this.text(item.valor, x + 5, y - 10, { fill: '#000' });
        });
    }

    // Gráfica de barras horizontales
    drawHorizontalBarChart(data, options = {}) {
        const colors = options.colors || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#8e44ad'];
        const maxValue = Math.max(...data.map(d => d.valor));
        const barHeight = 40;  // Hacer las barras más altas
        const barSpacing = 10;

        data.forEach((item, index) => {
            const barWidth = (item.valor / maxValue) * (this.width - 100);  // Deja espacio para etiquetas
            const y = index * (barHeight + barSpacing);

            this.rect(0, y, barWidth, barHeight, { fill: colors[index % colors.length] });

            // Añadir etiquetas
            this.text(item.nombre_pais, 5, y + barHeight / 2, { fill: '#000', 'dominant-baseline': 'middle' });
            this.text(item.valor, barWidth + 10, y + barHeight / 2, { fill: '#000', 'dominant-baseline': 'middle' });
        });
    }

    // Gráfica de líneas
    drawLineChart(data, options = {}) {
        const margin = 50;
        const maxValue = Math.max(...data.map(d => d.valor));
        const points = data.map((item, index) => {
            const x = margin + (index / (data.length - 1)) * (this.width - 2 * margin);
            const y = this.height - margin - (item.valor / maxValue) * (this.height - 2 * margin);
            return { x, y, label: item.valor, country: item.nombre_pais };
        });

        const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
        const polyline = this.createSVGElement('polyline', {
            points: linePoints,
            stroke: '#3498db',
            'stroke-width': 3,  // Línea más gruesa
            fill: 'none'
        });
        this.svg.appendChild(polyline);

        points.forEach(point => {
            this.text(point.label, point.x, point.y - 10, { fill: '#000', 'font-size': '12px', 'text-anchor': 'middle' });
            this.circle(point.x, point.y, 6, { fill: '#3498db' });  // Puntos más grandes
            this.text(point.country, point.x, this.height - 5, { fill: '#000', 'font-size': '12px', 'text-anchor': 'middle' });
        });
    }

    // Gráfica de pastel
    drawPieChart(data, options = {}) {
        const colors = options.colors || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#8e44ad'];
        const total = data.reduce((sum, d) => sum + d.valor, 0);
        let currentAngle = 0;
        const radius = Math.min(this.width, this.height) / 2 - 20;  // Aumentar el radio del gráfico

        data.forEach((item, index) => {
            const sliceAngle = (item.valor / total) * 2 * Math.PI;
            const x1 = this.width / 2 + radius * Math.cos(currentAngle);
            const y1 = this.height / 2 + radius * Math.sin(currentAngle);
            const x2 = this.width / 2 + radius * Math.cos(currentAngle + sliceAngle);
            const y2 = this.height / 2 + radius * Math.sin(currentAngle + sliceAngle);
            currentAngle += sliceAngle;

            const pathData = [
                `M ${this.width / 2} ${this.height / 2}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${sliceAngle > Math.PI ? 1 : 0} 1 ${x2} ${y2}`,
                `Z`
            ].join(' ');

            const path = this.createSVGElement('path', {
                d: pathData,
                fill: colors[index % colors.length]
            });

            this.svg.appendChild(path);

            // Añadir nombre y valor al centro de la porción
            const labelX = this.width / 2 + (radius / 2) * Math.cos(currentAngle - sliceAngle / 2);
            const labelY = this.height / 2 + (radius / 2) * Math.sin(currentAngle - sliceAngle / 2);
            this.text(`${item.nombre_pais}: ${item.valor}`, labelX, labelY, { fill: '#fff', 'font-size': '12px', 'text-anchor': 'middle' });
        });
    }

    circle(cx, cy, r, attrs = {}) {
        const circle = this.createSVGElement('circle', { cx, cy, r, ...attrs });
        this.svg.appendChild(circle);
    }
    drawRadarChart(data, options = {}) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;
        const angleSlice = (2 * Math.PI) / data.length;
        const maxValue = Math.max(...data.map(d => d.valor));

        let radarPoints = '';
        data.forEach((item, i) => {
            const angle = i * angleSlice;
            const x = centerX + (item.valor / maxValue) * radius * Math.cos(angle);
            const y = centerY - (item.valor / maxValue) * radius * Math.sin(angle);
            radarPoints += `${x},${y} `;
            this.text(item.nombre_pais, x, y, { fill: '#000', 'font-size': '14px', 'text-anchor': 'middle' });
        });

        const polygon = this.createSVGElement('polygon', {
            points: radarPoints.trim(),
            fill: 'rgba(52, 152, 219, 0.5)',
            stroke: '#3498db',
            'stroke-width': 2
        });
        this.svg.appendChild(polygon);

        for (let i = 1; i <= 5; i++) {
            const r = (radius / 5) * i;
            const circle = this.createSVGElement('circle', {
                cx: centerX,
                cy: centerY,
                r: r,
                fill: 'none',
                stroke: '#bdc3c7',
                'stroke-width': 1
            });
            this.svg.appendChild(circle);
        }
    }
}

export default SVGGraph;
