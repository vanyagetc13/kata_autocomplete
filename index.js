const fetchUrl = 'https://api.github.com/search/repositories'
const autocompleteListNode = document.getElementById('autocomplete__list')
const repoListNode = document.getElementById('repos__list')
const searchInput = document.querySelector('.search')
const autocompleteList = {
	data: [],
	set(newData) {
		this.data = newData
		return this.data
	},
	getAll() {
		return this.data
	},
	getById(id) {
		return this.data.find(item => item.id === id)
	},
	getHtml() {
		const templater = (name, id) => `
			<li class='autocomplete__list-item'><button onclick='repoList.addRepo(${id})'>${name}</button></li>
		`
		return this.data.map(repo => templater(repo.name, repo.id)).join('')
	},
}
const repoList = {
	data: [],
	addRepo(id) {
		const newRepo = autocompleteList.getById(id)
		this.data.push(newRepo)
		updateRepoList()
		searchInput.value = ''
		searchInput.dispatchEvent(new Event('input'))
		searchInput.focus()
		return this.data
	},
	deleteRepo(id) {
		this.data = this.data.filter(item => item.id !== id)
		updateRepoList()
		return this.data
	},
	getHtml() {
		const templater = repo => {
			return `
			<li class='repos__list-item'>
				<div class="repo__card">
					<div class='information'>
						<span>Name: ${repo.name}</span>
						<span>Owner: ${repo.owner}</span>
						<span>Stars: ${repo.stars}</span>
					</div>
					<button class='delete__repo-btn' onclick='repoList.deleteRepo(${repo.id})'></button>
				</div>
			</li>
			`
		}
		return this.data.map(repo => templater(repo)).join('')
	},
}
function debounceDecorator(fn, ms) {
	let timeoutId
	return function () {
		const fnCall = () => {
			return fn.apply(this, arguments)
		}
		clearTimeout(timeoutId)
		timeoutId = setTimeout(fnCall, ms)
	}
}
function updateAutoCompleteList() {
	autocompleteListNode.innerHTML = autocompleteList.getHtml()
}
function updateRepoList() {
	repoListNode.innerHTML = repoList.getHtml()
}
function callApi(query) {
	const url = fetchUrl + '?q=' + query + '&per_page=5' // + '&sort=stars'
	console.log(url)
	fetch(url, {
		headers: {
			accept: 'application/vnd.github+jso',
			// Authorization: auth_token,
		},
	})
		.then(r => r.json())
		.then(json => json.items)
		.then(items =>
			items.map(item => {
				return {
					id: item.id,
					stars: item.watchers,
					name: item.name,
					owner: item.owner.login,
				}
			})
		)
		.then(data => autocompleteList.set(data))
		.then(() => {
			console.log(autocompleteList.getAll())
			updateAutoCompleteList()
		})
}
callApi = debounceDecorator(callApi, 300)

searchInput.addEventListener('input', e => {
	const value = e.target.value
	if (value === '') {
		autocompleteList.set([])
		updateAutoCompleteList()
		return
	}
	callApi(e.target.value)
})
