const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Simulación de Base de Datos de Usuarios
// La contraseña de ambos es "123" hasheada
const registeredUsers = [
    {
        id: 1, email: "designer@ar.com", name: "Admin", role: "admin", 
        passwordHash: '$2a$10$f.T.dGY/N.w5.3mYtJ.KkOkb8.b.Q3A/1.Jc071vL3kXjP2.Qh1eG'
    },
    {
        id: 2, email: "user@ar.com", name: "Usuario", role: "user", 
        passwordHash: '$2a$10$f.T.dGY/N.w5.3mYtJ.KkOkb8.b.Q3A/1.Jc071vL3kXjP2.Qh1eG'
    }
];

// Lógica para registrar (simulación de guardado en BD)
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    // Validar si el usuario ya existe (simulación)
    if (registeredUsers.find(u => u.email === email)) {
        return res.status(400).json({ error: "El usuario ya está registrado." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: registeredUsers.length + 1,
            email: email, name: name, role: "user", passwordHash: hashedPassword
        };
        
        registeredUsers.push(newUser); // Simulación de guardado
        
        res.status(201).json({ message: "Usuario registrado con éxito" });

    } catch (error) {
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

// Lógica para iniciar sesión (verificación de credenciales)
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = registeredUsers.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Crear el Token JWT (el pase de sesión)
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '1h' } 
    );

    res.json({
        token: token,
        user: { name: user.name, email: user.email, role: user.role }
    });
};

module.exports = { registerUser, loginUser };