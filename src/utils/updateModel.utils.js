export const updateModel = (model, data) => {
	const updatedModel = { ...model };
	for (const key in data) {
		if (Object.hasOwnProperty.call(data, key)) {
			const value = data[key];

			// Only ignore undefined and empty strings, but allow null
			if (value !== undefined && value !== "") {
				updatedModel[key] = value;
			}
		}
	}

	return updatedModel;
};
