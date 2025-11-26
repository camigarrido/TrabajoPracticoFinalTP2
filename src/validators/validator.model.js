export const validate = (req) => {
	if (!req || req.trim() === "") {
		return { valid: false, message: "El campo no puede estar vacío" };
	}
	return { valid: true, message: "ok" };
};

export const validateYear = (year) => {
	const currentYear = new Date().getFullYear();
	const yearNumber = Number(year);
	if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
		return response
			.status(422)
			.json({ message: "Formato de 'release_year' inválido." });
	}
};

export const validateEmail = (
	email,
	blockedDomains = ["yahoo", "netscape", "river"],
) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		return { valid: false, message: "Formato de email inválido." };
	}

	const domain = email.split("@")[1].toLowerCase();

	const isBlocked = blockedDomains.some((blocked) => domain.includes(blocked));

	if (isBlocked) {
		return { valid: false, message: `No se permiten cuentas de ${domain}.` };
	}

	return { valid: true, message: "Email válido." };
};
