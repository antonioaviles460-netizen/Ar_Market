const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; 

// Middleware #1: Verifica si hay un token válido
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET); 

            req.user = decoded; 
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Token no válido o expirado.' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'No autorizado, no se encontró token.' });
    }
};

// Middleware #2: Verifica si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};

module.exports = { protect, isAdmin };