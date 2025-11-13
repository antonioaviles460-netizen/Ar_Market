// Simulación de Base de Datos de Productos
const products = [];
for (let i = 1; i <= 20; i++) {
    const categories = ["mujer", "hombre", "accesorios"];
    products.push({
        id: i,
        name: `Camisa Urbana Slim Fit ${i}`,
        price: 1000 + i * 50,
        category: categories[i % 3],
        stock: Math.floor(Math.random() * 10) + 1,
        img: `https://picsum.photos/400/400?random=${i}`,
        // ...
    });
}

// Devuelve todos los productos (la primera carga de la app)
const getProducts = (req, res) => {
    // Aquí se podría aplicar lógica de filtrado y paginación
    res.json(products);
};

module.exports = { getProducts };