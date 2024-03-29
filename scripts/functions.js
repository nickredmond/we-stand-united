function orgLinkAnchor(row, col) {
	return document.querySelector("#link-" + row + "-" + col + " > a");
}
function orgLinkImage(row, col) {
	return document.querySelector("#link-" + row + "-" + col + " > a > img");
}
function setDonationUrl(row, col, donation_url) {
	orgLinkAnchor(row, col).setAttribute("href", donation_url);
}
function setLinkTitle(row, col, title) {
	orgLinkAnchor(row, col).setAttribute("title", title);
}
function setLogoImgSrc(row, col, img_src) {
	var img = orgLinkImage(row, col);
	img.setAttribute("src", img_src);
	img.style.height = ICON_HEIGHT;
}

function clearOrgLinks() {
	document.querySelectorAll(".linkContainer").forEach(function(container){
		container.style.visibility = "hidden";
	});
	document.querySelectorAll(".linkIcon").forEach(function(icon){
		icon.style.height = "0";
	});
}
function populateOrgLink(row, col, organization) {
	document.querySelector("#link-" + row + "-" + col).style.visibility = "visible";
	setDonationUrl(row, col, organization["donation_url"]);
	setLinkTitle(row, col, organization["name"]);
	setLogoImgSrc(row, col, organization["logo_img_src"]);
}
function populateOrgLinks(organizations) {
	clearOrgLinks();
	for (var i = 0; i < organizations.length && i < 6; i++) {
		var key = i.toString();
		populateOrgLink(
			POSITION_INDEX_MAPPING[key]["row"],
			POSITION_INDEX_MAPPING[key]["col"],
			organizations[i]
		);
	}
}

function onResultsFound(isHidden) {
	var label = document.getElementById("no_results");
	if (isHidden) {
		label.style.visibility = "hidden";
		label.style.display = "none";
	}
	else {
		label.style.visibility = "visible";
		label.style.display = "block";
	}
}

var currentQueryKeyword = "all";
function filterOrganizationsByKeyword(query) {
	filterResults = [];
	ALL_ORGANIZATIONS.forEach(function(organization){
		var numKeywordsMatched = 0;
		var isQueryKeywordMatched = false;
		organization["keywords"].forEach(function(keyword){
			query = query.toLowerCase();
			keyword = keyword.toLowerCase();
			if (query.indexOf(keyword) >= 0 || keyword.indexOf(query) >= 0){
				numKeywordsMatched += 1;
			}
			if (keyword.indexOf(currentQueryKeyword) >= 0 || currentQueryKeyword.indexOf(keyword) >= 0){
				isQueryKeywordMatched = true;
				numKeywordsMatched += 1;
			}
		});
		if ((currentQueryKeyword !== "all" && isQueryKeywordMatched === false) ||
				(currentQueryKeyword !== "all" && isQueryKeywordMatched === true && query !== "" && 
					query !== null && numKeywordsMatched === 1)) {
			numKeywordsMatched = -1000;
		}
		filterResults.push({
			"orgName": organization["name"], 
			"matches": numKeywordsMatched
		});
	});
	filterResults = filterResults.filter(function(result){
		return (result["matches"] > 0);
	});
	console.log("rez " + JSON.stringify(filterResults));

	if (filterResults.length === 0) {
		clearOrgLinks();
		onResultsFound(false);
	}
	else {
		onResultsFound(true);
		var sortedResults = filterResults.sort(function(a, b){
			return b["matches"] - a["matches"];
		});
		var filteredOrgs = [];
		sortedResults.forEach(function(result){
			var org = ALL_ORGANIZATIONS.find(function(organization){
				return organization["name"] === result["orgName"];
			});
			filteredOrgs.push(org);
		});
		populateOrgLinks(filteredOrgs);
	}
}

var previousCategoryImgSrc = "img/categories/all.png";
var isCategoriesVisible = false;

function onSelectingCategory(isSelectingCategory) {
	var img = document.getElementById("category_selected_img");
	var img_src = previousCategoryImgSrc;
	if (isSelectingCategory) {
		previousCategoryImgSrc = img.getAttribute("src");
		img_src = "img/categories/open_categories.png";
	}

	img.setAttribute("src", img_src);
}
function onSettingCategoriesVisible(isVisible) {
	isCategoriesVisible = !isCategoriesVisible;
	if (isVisible) {
		document.getElementById("categories").style.visibility = "visible";
		document.querySelector("#categories > table").style.display = "block";
		document.getElementById("categories").style.height = "auto";

		document.getElementById("charities").style.visibility = "hidden";
		document.getElementById("charities").style.display = "none";
		document.getElementById("charities").style.height = "0";
	}
	else {
		document.getElementById("categories").style.visibility = "hidden";
		document.querySelector("#categories > table").style.display = "none";
		document.getElementById("categories").style.height = "0";

		document.getElementById("charities").style.visibility = "visible";
		document.getElementById("charities").style.display = "block";
		document.getElementById("charities").style.height = "auto";
	}
}

document.getElementById("query").addEventListener("input", function(){
	filterOrganizationsByKeyword(this.value);
});
document.getElementById("category_selected_btn").addEventListener("mouseenter", function(){
	onSelectingCategory(true);
});
document.getElementById("category_selected_btn").addEventListener("mouseleave", function(){
	onSelectingCategory(false);
});
document.getElementById("category_selected_btn").addEventListener("click", function(){
	onSettingCategoriesVisible(true);
});
document.getElementById("cancel_btn").addEventListener("click", function(){
	onSettingCategoriesVisible(false);
});
document.querySelectorAll(".category_link > a").forEach(function(anchor){
	var keyword = anchor.getAttribute("keyword");
	anchor.addEventListener("click", function(){
		currentQueryKeyword = keyword;
		var query = document.getElementById("query").value;
		filterOrganizationsByKeyword(query);
		document.getElementById("category_selected_img")
			.setAttribute("src", "img/categories/" + keyword + ".png");
		onSettingCategoriesVisible(false);
	});
});
populateOrgLinks(DEFAULT_ORGANIZATIONS);