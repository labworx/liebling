import $ from 'jquery'
import slick from 'slick-carousel'
import stickybits from 'stickybits'
import mediumZoom from 'medium-zoom'
import fitvids from 'fitvids'
import shave from 'shave'
import {
  isRTL,
  isMobile,
  adjustImageGallery,
  managePostImages,
  makeImagesZoomable
} from './helpers'

let $aosWrapper = null
let $progressCircle = null
let lastScrollingY = window.pageYOffset
let lastWindowHeight = 0
let lastDocumentHeight = 0
let circumference = 0
let isTicking = false

function onScrolling() {
  lastScrollingY = window.pageYOffset
  requestTicking()
}

function adjustShare(timeout) {
  if (!isMobile('1023px')) {
    stickybits('.js-sticky', { stickyBitStickyOffset: 100 })
    $('body').removeClass('share-menu-displayed')
  } else {
    $('body').addClass('share-menu-displayed')
    setTimeout(() => {
      $aosWrapper.removeAttr('data-aos')
    }, timeout)
  }
}

function onResizing() {
  setHeights()
  adjustShare(100)

  setTimeout(() => {
    setCircleStyles()
    requestTicking()
  }, 200)
}

function requestTicking() {
  if (!isTicking) {
    requestAnimationFrame(updating)
  }

  isTicking = true
}

function updating() {
  const progressMax = lastDocumentHeight - lastWindowHeight
  const percent = Math.ceil((lastScrollingY / progressMax) * 100)

  if (percent <= 100) {
    setProgress(percent)
  }

  isTicking = false
}

function setHeights() {
  lastWindowHeight = window.innerHeight
  lastDocumentHeight = $(document).height()
}

function setCircleStyles() {
  const svgWidth = $progressCircle.parent().width();
  const radiusCircle = svgWidth / 2
  const borderWidth = isMobile() ? 2 : 3

  $progressCircle.parent().attr('viewBox', `0 0 ${svgWidth} ${svgWidth}`)
  $progressCircle.attr('stroke-width', borderWidth)
  $progressCircle.attr('r', radiusCircle - (borderWidth - 1))
  $progressCircle.attr('cx', radiusCircle)
  $progressCircle.attr('cy', radiusCircle)

  circumference = radiusCircle * 2 * Math.PI

  $progressCircle[0].style.strokeDasharray = `${circumference} ${circumference}`
  $progressCircle[0].style.strokeDashoffset = circumference
}

function setProgress(percent) {
  if (percent <= 100) {
    const offset = circumference - percent / 100 * circumference
    $progressCircle[0].style.strokeDashoffset = offset
  }
}

function prepareProgressCircle() {
  $progressCircle = $('.js-progress')

  setHeights()
  setCircleStyles()
  updating()

  setTimeout(() => {
    $progressCircle.parent().css('opacity', 1)
  }, 300)
}

$(document).ready(() => {
  $aosWrapper = $('.js-aos-wrapper')
  const $scrollButton = $('.js-scrolltop')
  const $loadComments = $('.js-load-comments')
  const $commentsIframe = $('.js-comments-iframe')
  const $recommendedArticles = $('.js-recommended-articles')

  fitvids('.js-post-content')

  adjustImageGallery()
  adjustShare(1000)

  if ($recommendedArticles.length > 0) {
    $recommendedArticles.on('init', function () {
      prepareProgressCircle()

      shave('.js-article-card-title', 100)
      shave('.js-article-card-title-no-image', 250)
    })

    $recommendedArticles.slick({
      arrows: true,
      infinite: true,
      prevArrow: '<button class="m-icon-button filled in-recommended-articles slick-prev" aria-label="Previous"><span class="icon-arrow-left"></span></button>',
      nextArrow: '<button class="m-icon-button filled in-recommended-articles slick-next" aria-label="Next"><span class="icon-arrow-right"></span></button>',
      mobileFirst: true,
      responsive: [
        {
          breakpoint: 720,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 1023,
          settings: {
            arrows: false,
            slidesToShow: 3
          }
        }
      ],
      rtl: isRTL()
    })
  }

  $scrollButton.click(() => {
    $('html, body').animate({
      scrollTop: 0
    }, 500)
  })

  $loadComments.click(() => {
    $loadComments.parent().hide()
    $commentsIframe.fadeIn('slow')
  })

  managePostImages($)
  makeImagesZoomable($, mediumZoom)

  window.addEventListener('scroll', onScrolling, { passive: true })
  window.addEventListener('resize', onResizing, { passive: true })
})

$(window).on('load', () => {
  prepareProgressCircle()
})
