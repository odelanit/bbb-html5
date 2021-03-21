'use strict';

$(document)
  .on('click', '.dropdown-trigger', function (e) {
    e.preventDefault();
    var parentEl = $(this)
      .closest('.dropdown');
    $('.dropdown:not(.is-hoverable)')
      .not(parentEl)
      .removeClass('is-active');
    parentEl.toggleClass('is-active');
    e.stopPropagation();
  });
