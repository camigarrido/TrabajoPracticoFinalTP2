export const validate = (name) => {
	if (!name || name.trim() === "") {
		// Verifica si el nombre está vacío o solo contiene espacios en blanco
		return { valid: false, message: "El campo no puede estar vacío" };
	}
	return { valid: true, message: "ok" };
};
