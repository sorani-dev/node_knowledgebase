document.querySelectorAll('.delete-article').forEach(article => {
    article.addEventListener('click',e => {
        if (confirm('Delete article?') === true) {
            const id = e.target.getAttribute('data-id')
            const request = async () => {
                try {
                    const response = await fetch(`/article/${id}`,{
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    console.log(response,data);
                    if (response.ok) {
                        // console.log(data);
                        alert('Deleted article')
                        window.location.href = '/'
                    }
                    throw data
                } catch (err) {
                    console.error(err);
                    alert('Could not delete article')
                }
            }
            request()
        }
        e.preventDefault()
    })
})