export const updateModel = (model, data) => {
	const updatedModel = { ...model };
	for (const key in data) {
		if (Object.hasOwn(updateModel, key)) {
			const value = data[key];

			if (value !== null && value !== undefined && value !== "") {
				updatedModel[key] = value;
			}
		}
	}

	return updatedModel;
};
