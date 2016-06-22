(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Utils = require('./../Core/Utils');

module.exports = function () {

	function init() {
		var windowLocationHREF = window.location.href;

		update();

		setInterval(function () {
			if (windowLocationHREF !== window.location.href) {
				windowLocationHREF = window.location.href;
				update();
			}
		}, 100);
	}

	function update() {
		Utils.getCards().each(function () {
			var progressText = Utils.getCardChecklists($(this)).find('.badge-text').text();
			drawProgressLine($(this), progressText);
		});
	}

	function drawProgressLine(card, progressText) {
		var completed = 0,
			total = 1,
			percent = 0,
			progressStatus = 'not_started',
			progressLine;

		if (progressText) {
			if (progressText.indexOf('/')) {
				completed = progressText.split('/')[0];
				total = progressText.split('/')[1];
				percent = (completed / total) * 100;

				if (percent === 0) {
					progressStatus = 'not_started';
				}

				if (percent > 0) {
					progressStatus = 'started';
				}

				if (percent > 25) {
					progressStatus = 'in_progress';
				}

				if (percent > 75) {
					progressStatus = 'nearly_done';
				}

				if (percent === 100) {
					progressStatus = 'complete';
				}

				card.append('<span class="be-CardChecklistCompletionLine be-CardChecklistCompletionLine--' + progressStatus + '"></span>');

				progressLine = card.find('.be-CardChecklistCompletionLine');
				progressLine.css('width', (percent + '%'));

				return true;
			}
		}

		return false;
	}

	return {
		init: init
	}

}();

},{"./../Core/Utils":4}],2:[function(require,module,exports){
'use strict';

var Utils = require('./../Core/Utils');

module.exports = function () {

	var init = function () {
		var windowLocationHREF = window.location.href;

		addLabelFilterToListHeader();

		update();

		setInterval(function () {
			if (windowLocationHREF !== window.location.href) {
				windowLocationHREF = window.location.href;
				update();
			}
		}, 100);
	};

	var addLabelFilterToListHeader = function (list) {

		Utils.getLists().each(function () {
			var list = $(this);
			var listHeader = list.find('.list-header'),
				filterTriggerButton,
				filterList;

			listHeader.append('<a class="be-CardFilterByLabel__trigger dark-hover"><span class="icon-sm icon-label"></span></a>');
			listHeader.append('<ul class="be-CardFilterByLabel__list"></ul>');

			filterTriggerButton = listHeader.find('.be-CardFilterByLabel__trigger');
			filterList = listHeader.find('.be-CardFilterByLabel__list');

			filterList.hide(0);

			filterTriggerButton.bind('click', function () {
				$(this).closest('.list-header').find('.be-CardFilterByLabel__list').toggle();
			});

		});

	};


	function update() {
		Utils.getLists().each(function () {
			var list = $(this);

			var filterList = list.find('.be-CardFilterByLabel__list'),
				listLabelsTemp = [],
				listLabels = [],
				i,
				j;

			Utils.getCards($(this)).each(function () {
				Utils.getCardLabels($(this)).each(function () {
					var cardLabel = {
						colour: Utils.getCardLabelColourFromClass($(this).attr('class')),
						title: $(this).attr('title')
					};

					listLabelsTemp.push(cardLabel);
				});
			});

			// Only push unique labels into the listLabels array
			for (i = 0; i < listLabelsTemp.length; i++) {
				var exists;

				for (j = 0; j < listLabels.length; j++) {
					exists = false;

					if (listLabels[j].colour === listLabelsTemp[i].colour) {
						exists = true;
						break;
					}
				}

				if (!exists) {
					listLabels.push(listLabelsTemp[i]);
				}
			}

			updateLabelFilterList(filterList, listLabels);

		});

	}


	function updateLabelFilterList(filterList, listLabels) {
		var i;

		filterList.html('<li><label><input type="checkbox" name="no-labels" checked="checked" />[ No Labels ]</label></li>');

		for (i = 0; i < listLabels.length; i++) {
			var listLabelTitle = listLabels[i].title,
				colour = listLabels[i].colour;

			if (!listLabelTitle) {
				listLabelTitle = '( ' + colour.substr(0, 1).toUpperCase() + colour.substr(1, colour.length) +' )';
			}
			filterList.append('<li><label><input type="checkbox" name="' + colour + '" checked="checked" />' + listLabelTitle + '</label></li>');

			filterList.find('[type="checkbox"]').change(function () {
				updateFilter(filterList);
			});
		}
	}


	function updateFilter(filterList) {
		var list = filterList.closest('.list'),
			listCards = list.find('.list-card'),
			labelsToFilterBy = [],
			foundCardsTotal = 0,
			listCardsTotal = Utils.getListCardsTotal(list);

		filterList.find('[type="checkbox"]').each(function () {
			if (this.checked) {
				labelsToFilterBy.push($(this).attr('name'));
			}
		});

		list.attr('data-be-CardFilterByLabel', labelsToFilterBy.join(','));

		listCards.each(function () {
			var card = $(this),
				showCard = false,
				listCardLabels = Utils.getCardLabels(card);

			if (listCardLabels.length === 0) {
				if (labelsToFilterBy.indexOf('no-labels') > -1) {
					showCard = true;
				} else {
					showCard = false;
				}
			} else {
				listCardLabels.each(function () {
					var colour = Utils.getCardLabelColourFromClass($(this).attr('class'));

					if (labelsToFilterBy.indexOf(colour) > -1) {
						showCard = true;
					}
				});
			}

			if (showCard) {
				card.removeClass('hide');
				foundCardsTotal += 1;
			} else {
				card.addClass('hide');
			}

		});

		Utils.updateListHeaderNumCards(list, listCardsTotal, foundCardsTotal);

	}


	return {
		init: init
	}

}();

},{"./../Core/Utils":4}],3:[function(require,module,exports){
'use strict';

var Utils = require('./../Core/Utils');

module.exports = function () {

	/*
	 Sums up the card points in a particular list
	 */
	function init(lists) {
		var windowLocationHREF = window.location.href;

		update(lists);

		setInterval(function () {
			if (windowLocationHREF !== window.location.href) {
				windowLocationHREF = window.location.href;
				update(lists);
			}
		}, 100);

	}

	function update(lists) {
		lists.each(function () {
			var list = $(this),
				listHeader = list.find('.list-header'),
				beListPointsTotal,
				listCards = Utils.getCards(list),
				total = 0;

			beListPointsTotal = listHeader.find('.be-list-points-total');
			if (beListPointsTotal.length === 0) {
				listHeader.append('<p class="be-list-points-total"></p>');
				beListPointsTotal = listHeader.find('.be-list-points-total');
			}

			listCards.each(function () {
				var listCard = $(this),
					cardID = listCard.find('.card-short-id').text(),
					title = listCard.find('.list-card-title').text(),
					titleStrippedOfNumber = title.substr(cardID.length, title.length),
					cardPoints = 0;

				if (titleStrippedOfNumber.indexOf('(') === 0) {
					cardPoints = parseInt(titleStrippedOfNumber.substring(1, titleStrippedOfNumber.indexOf(')') + 1));

					if (isNaN(cardPoints)) {
						cardPoints = 0;
					}
				}

				total += cardPoints;
			});

			beListPointsTotal.html(total + ' points');

		});
	}


	return {
		init: init
	}

}();

},{"./../Core/Utils":4}],4:[function(require,module,exports){
'use strict';

module.exports = function () {

	var lists = null;

	function getListCardsTotal(list) {
		return list.find('.list-card').length;
	}

	function addListsHeaderCardCounter(lists) {

		lists.each(function () {
			var list = $(this),
				listCards = list.find('.list-card'),
				listHeader = list.find('.list-header');

			listHeader.append('<p class="be-ListHeaderCardCounter">' + listCards.length + ' cards</p>');

		});
	}

	function getListHeaderCardCounter(list) {
		if (list) {
			return list.find('.be-ListHeaderCardCounter');
		}
		return null;
	}

	function updateListHeaderNumCards(list, total, found) {
		var listHeaderNumCards = getListHeaderCardCounter(list);

		if (listHeaderNumCards) {
			listHeaderNumCards.attr('data-total', total);

			if (found === total) {
				listHeaderNumCards.html(total + ' cards');
			} else {
				listHeaderNumCards.html(found + ' / ' + total + ' cards');
			}

			return true;
		}

		return false;
	}


	function isLoaded() {
		return getLists();
	}


	function getLists() {
		if (!lists) {
			lists = $('.list');
		}
		return lists;
	}

	function getCards(list) {
		if (list) {
			return list.find('.list-card');
		}
		return $('.list-card');
	}

	function getCardChecklists(card) {
		return card.find('[title="Checklist items"]');
	}

	function getCardLabels(card) {
		return card.find('.card-label');
	}

	function getCardLabelColourFromClass(className) {
		var classes = className.split(' '),
			i,
			result = '';

		for (i = 0; i < classes.length; i++) {
			if (classes[i].indexOf('card-label-') > -1) {
				result = classes[i].split('-')[2];
				break;
			}
		}
		
		return result;
	}

	function removeDuplicateObjectsFromArray(arr, field) {
		var u = [];
		arr.reduce(function (a, b) {
			if (a[field] !== b[field]) u.push(b);
			return b;
		}, []);
		return u;
	}


	function init() {
		addListsHeaderCardCounter(getLists());
	}

	return {
		init: init,
		isLoaded: isLoaded,
		getLists: getLists,
		getCards: getCards,
		getCardChecklists: getCardChecklists,
		getCardLabels: getCardLabels,
		getListCardsTotal: getListCardsTotal,
		updateListHeaderNumCards: updateListHeaderNumCards,
		getListHeaderCardCounter: getListHeaderCardCounter,
		getCardLabelColourFromClass: getCardLabelColourFromClass,
		removeDuplicateObjectsFromArray: removeDuplicateObjectsFromArray
	}

}();

},{}],5:[function(require,module,exports){
'use strict';

var Utils = require('./../Core/Utils');

module.exports = function () {

	/*
	 Adds a search box to each list for simple filtering of cards based on their title
	 */
	var init = function (lists) {
		lists.each(function () {
			addSearchToList($(this));
		})
	};

	var addSearchToList = function (list) {
		var listHeader = list.find('.list-header'),
			inputSearch,
			listCards = list.find('.list-card'),
			listCardsTotal = Utils.getListCardsTotal(list);

		listHeader.append('<input class="be-ListSearch__input" placeholder="Search..." type="text" />');

		inputSearch = listHeader.find('.be-ListSearch__input');
		inputSearch.bind('keyup', function () {
			var value = $(this).val();
			var foundCardsTotal = 0;

			listCards.each(function () {
				var card = $(this),
					title = card.find('.list-card-title').text(),
					usernames = '';

				card.find('.member-avatar').each(function () {
					usernames += $(this).attr('title') + ' ';
				});

				if (title.toLowerCase().indexOf(value.toLowerCase()) > -1 || usernames.toLowerCase().indexOf(value.toLowerCase()) > -1) {
					card.removeClass('hide');
					foundCardsTotal += 1;
				} else {
					card.addClass('hide');
				}

			});

			Utils.updateListHeaderNumCards(list, listCardsTotal, foundCardsTotal);

		});

	};

	return {
		init: init
	}

}();

},{"./../Core/Utils":4}],6:[function(require,module,exports){
'use strict';

// ==UserScript==
//
// @namespace      http://www.barryels.com/
//
// @history        1.0 first version
//
// ==/UserScript==

var Utils = require('./features/Core/Utils');
var ListSearch = require('./features/ListSearch/ListSearch');
var CardPoints = require('./features/CardPoints/CardPoints');
var CardChecklistCompletionLine = require('./features/CardChecklistCompletionLine/CardChecklistCompletionLine');
var CardFilterByLabel = require('./features/CardFilterByLabel/CardFilterByLabel');

window.$ = window.jQuery = jQuery.noConflict(true);

window.addEventListener("load", init, false);

function init() {
	console.log('Trello Extras is running...');
	var loadInterval;

	loadInterval = window.setInterval(function () {
		if (Utils.isLoaded()) {
			window.clearInterval(loadInterval);
			onLoaded();
		}
	}, 100);
}

function onLoaded() {
	Utils.init();
	CardPoints.init(Utils.getLists());
	ListSearch.init(Utils.getLists());
	CardChecklistCompletionLine.init();
	CardFilterByLabel.init(Utils.getLists());
}

},{"./features/CardChecklistCompletionLine/CardChecklistCompletionLine":1,"./features/CardFilterByLabel/CardFilterByLabel":2,"./features/CardPoints/CardPoints":3,"./features/Core/Utils":4,"./features/ListSearch/ListSearch":5}]},{},[6])
//# sourceMappingURL=index.user.js.map
