const githubStaticA = "https://github.com/";
const githubStaticB = "?tab=repositories";
let counter;

function getRepoName(url) {
	return new Promise(function(resolve) {
		fetch(url, {
			method: 'GET'
		}).then(response => {
			return response.text();
		}).then(function(text) {
			const gets = text.split('\n');
			for (let i = 0; i < gets.length; i++) {
				if (gets[i].indexOf('name codeRepository') > -1) {
					const repo = gets[i].split('"');
					if (repo.length == 0) {
						resolve(null);
					} else {
						resolve(repo[1].replace(githubStaticA, ''));
					}
				}
			}
		});
	});
}

function getRepoDescription(url) {
	return new Promise(function(resolve) {
		fetch(url, {
			method: 'GET',
			mode: 'no-cors'
		}).then(response => {
			return response.text();
		}).then(function(text) {
			const gets = text.split('\n');
			for (let i = 0; i < gets.length; i++) {
				if (gets[i].indexOf('<title>') > -1) {
					const repo = gets[i].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
					if (repo.length == 0) {
						resolve(null);
					} else {
						resolve(repo);
					}
				}
			}
		});
	});
}

function checkRepo() {
	return new Promise(function(resolve) {
		clearInterval(counter);
		const repoList = window.localStorage.getItem("repoList");
		if (repoList != null) {
			const lists = repoList.split(',');
			for (let i = 0; i < lists.length; i++) {
				if (lists[i].length > 1) {
					getRepoName(githubStaticA + lists[i] + githubStaticB).then(function(result) {
						const repoName = window.localStorage.getItem(lists[i]);
						if (result == null) {
							window.localStorage.setItem(repoName, result);
						} else {
							if (repoName != result) {
								getRepoDescription(githubStaticA + result + githubStaticB).then(function(result) {
									alert("Update Repository: " + result);
								});
								window.localStorage.setItem(lists[i], result);
							} else {
								console.log("Same Repository: " + githubStaticA + lists[i] + " -> latest:  " + result);
							}
						}
					});
					if (i == lists.length - 1) {
						resolve();
					}
				} 
			}
		}
	});
}

$(function(){
	$('#addButtonTask').click(function () {
		const newTask = $('#taskInput').val();

		getRepoName(githubStaticA + newTask + githubStaticB).then(function(result) {
			if (result == null) {
				alert("Repository: (" + newTask +") not found!");
				return;
			} else {
				const repoList = window.localStorage.getItem("repoList");
				if (repoList != null) {
					if (repoList.indexOf(newTask + ",") > -1) {
						alert("Repository: (" + newTask +") already exists!");
						return;
					} else {
						window.localStorage.setItem("repoList", repoList + newTask + ",");
					}
				} else {
					window.localStorage.setItem("repoList", newTask + ",");
				}
				window.localStorage.setItem(newTask, result);
				addListItem(newTask);
			}
			return;
		});
	});
})

function addListItem(value) {
	document.getElementById("taskInput").value = "";
	let ul = document.getElementById("todo-listUl");
	addUI(ul, value)
}

function loadList() {
	const repoList = window.localStorage.getItem("repoList");
	if (repoList != null) {
		const lists = repoList.split(',');
		for (let i = 0; i < lists.length; i++) {
			if (lists[i].length > 1) {
				let ul = document.getElementById("todo-listUl");
				addUI(ul, lists[i])
			}
		} 
	}
}

function addUI(ul, value) {
	let li = document.createElement("li");
	$("li").addClass("list-group-item");
	li.appendChild(document.createTextNode(value));

	if (value === '') {
	  //do nothing
	} else {
	  ul.appendChild(li);
	}

	let span = document.createElement("SPAN");
	const txt = document.createTextNode("\u00D7");
	span.className = "close1";
	span.appendChild(txt);
	li.appendChild(span);

	$(".close1").click(function () {
		const index = $(this).index(".close1");
		let div = this.parentElement;
		div.style.display = "none";
		removeItem(index);
		$(".close1").eq(index).remove();
	})
}

function removeItem(itemIndex) {
	let strs = "";
	const repoList = window.localStorage.getItem("repoList");
	if (repoList != null) {
		const lists = repoList.split(',');
		for (let i = 0; i < lists.length; i++) {
			if (lists[i].length > 1) {
				if (i == itemIndex) {
					window.localStorage.removeItem(lists[i]);
				} else {
					strs = strs + lists[i] + ","
				}
			}
		} 
		window.localStorage.setItem("repoList", strs);
	}
}

window.onload = function() {
	loadList();
	checkRepo();
};
