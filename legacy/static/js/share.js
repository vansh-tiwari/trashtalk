const shareBtn = document.querySelector('#share-button');
const title = document.title;
const ogBtnContent = "🙁";
const url = document.querySelector('link[rel=canonical]') &&
            document.querySelector('link[rel=canonical]').href ||
            window.location.href;

shareBtn.addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: `${title}`,
      text: "Check my profile. Compare your's and share with your friends.\n",
      url: `${url}`
    }).then(() => {
      showMessage(shareBtn, '😄');
    })
    .catch(err => {
      showMessage(shareBtn, `🙁`);
    });
  } else {
    copyClip();
  }
});

function copyClip(){
    var tmpVar = document.createElement('input');
    text = window.location.href;
    document.body.appendChild(tmpVar);
    tmpVar.value = text;
    tmpVar.select();
    document.execCommand('copy');
    document.body.removeChild(tmpVar);
    alert('Link copied');
}

function showMessage(element, msg) {
  element.textContent = msg;
  setTimeout(() => {
    element.textContent = ogBtnContent;
  }, 2000);
}