function uploadPreview() {
    let preview = document.getElementById("upload-preview");
    let when = document.getElementById("when");
    let textArea = document.getElementById("text-to-post");

    if (when.value == '¿Cuándo?') {
        when = 'Por favor Elige cuando. '
    } else {
        when = when.options[when.selectedIndex].text + ',' 
    }

    preview.innerHTML = `${when} ${textArea.value}. ADV`;
}