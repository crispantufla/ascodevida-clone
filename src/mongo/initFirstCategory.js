const initFirstCategory = (Category) => {

    const data = [
        {
            name: "Amistad",
            shortName: "amistad"
        },
        {
            name: "Así va España",
            shortName: "ave"
        },
        {
            name: "Estudios",
            shortName: "estudios"
        },
        {
            name: "Picante",
            shortName: "picante"
        },
        {
            name: "Trabajo",
            shortName: "trabajo",
        },
        {
            name: "Amor",
            shortName: "amor"
        },
        {
            name: "Dinero",
            shortName: "dinero"
        },
        {
            name: "Familia",
            shortName: "familia"
        },
        {
            name: "Salud",
            shortName: "salud"
        },
        {
            name: "Varios",
            shortName: "varios"
        }
    ];

    Category.countDocuments().then((count) => {
        if (count === 0) {
            data.forEach(category => {
                Category.create(category).then(newCategory => {
                    console.log('\n Created Category: \n' + newCategory)
                })
            })
        };
    });
};

module.exports = {initFirstCategory};