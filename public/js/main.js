document.querySelectorAll('.delete-article').forEach(article => {
    article.addEventListener('click',e => {
        if (confirm('Delete article?') === true) {
            // Get the article id
            const id = e.target.getAttribute('data-id')
            const request = async () => {
                try {
                    const response = await fetch(`/articles/${id}`,{
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    console.log(response,data);
                    // Response is ok and the article was deleted
                    if (response.ok && data.success === true) {
                        console.log(data);
                        insert(`<div class="alert alert-success">Deleted article<br>Wait while you are redirected...</div>`)
                        // alert('Deleted article')
                        setTimeout(() => {
                            window.location.href = '/'
                        },1000);
                        return false
                    }
                    throw data
                } catch (err) {
                    console.error(err);
                    // alert('Could not delete article')
                    insert(`<div class="alert alert-danger">Could not delete article</div>`)
                }
            }
            request()
        }
        e.preventDefault()
    })

    function insert(text) {
        const d = document.createElement('div')
        d.innerHTML = text
        document.querySelector('.container').insertBefore(d,document.querySelector('h1'))
    }
})