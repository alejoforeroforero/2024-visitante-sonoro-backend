const checkAuth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("La autenticación falló 1");
    }
    //const decodedToken = jwt.verify(token, "clave_secreta");
    next();
  } catch (err) {
    res.json({ m: "La autenticación falló", m2: err.message });
    return;
  }
};

exports.checkAuth = checkAuth;
