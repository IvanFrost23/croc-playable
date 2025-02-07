document.addEventListener('DOMContentLoaded', function() {
    if (window.mraid) {
        mraid.addEventListener('ready', onMraidReady);

        if (mraid.getState() === 'ready') {
            onMraidReady();
        }
    } else {
        window.startGame();
    }
});

function onMraidReady() {
    if (window.gameStarted) {
        return;
    }

    window.startGame();
}

function onCTAClick() {
    if (window.mraid && typeof mraid.open === 'function') {
        var storeUrl = "https://play.google.com/store/apps/details?id=com.cleverapps.crocword&hl=en";
        mraid.open(storeUrl);
    } else if (typeof FbPlayableAd !== 'undefined' && FbPlayableAd.onCTAClick) {
        FbPlayableAd.onCTAClick();
    } else {
        alert("GAME OVER!");
    }
}
