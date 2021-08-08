async function voteFetch(params) {
    let finalPath = null;
    let parentElementId = params.element.parentNode.parentNode.dataset.id;

    if (params.path == 'vota') {
        finalPath = `/${params.path}/${parentElementId}/${params.type}`;
    };

    if (params.path == 'addfav') {
        finalPath = `/${params.path}/${parentElementId}`;
    };

    fetch(finalPath, { method: params.method }).then(response => response.json()
    ).then(data => {
        return params.element.parentNode.innerHTML = data.message
    });
}