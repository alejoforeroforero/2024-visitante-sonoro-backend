const crearFriendlyUrl = (str) => {
  const urlString = str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-_]/g, "");

    return urlString;
};

exports.crearFriendlyUrl = crearFriendlyUrl;
