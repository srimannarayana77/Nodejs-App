async function userFilters(params) {
    try {
        let filters = {};

        const { name, email, ageMin, username } = params;

        if (name) {
            filters.name = RegExp(name, 'i') ;
        }

        if (email) {
            filters.email = email;
        }

        if (ageMin) {
            filters.age = { $gte: ageMin };
        }

        if (username) {
            filters.username = username;
        }
        return filters

    } catch (error) {
        console.error('Error applying filters:', error);
        throw error;
    }
}

module.exports = userFilters;
