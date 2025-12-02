/**
 * AIS Stream Custom Cast Receiver
 * Supports custom HTTP headers for authentication
 */

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// Store custom data globally for use in request handlers
let currentCustomData = null;

// Intercept network requests to add custom headers
playerManager.setMessageInterceptor(
    cast.framework.messages.MessageType.LOAD,
    (loadRequestData) => {
        console.log('[Receiver] LOAD request received');
        console.log('[Receiver] Media URL:', loadRequestData.media.contentUrl);
        
        if (loadRequestData.media.customData) {
            console.log('[Receiver] Custom data:', loadRequestData.media.customData);
            
            // Store custom data globally
            currentCustomData = {
                userid: loadRequestData.media.customData.userid,
                authinfo: loadRequestData.media.customData.authinfo,
                usersessionid: loadRequestData.media.customData.usersessionid
            };
            
            console.log('[Receiver] Stored custom data for request handlers');
        }
        
        // Hide splash screen
        setTimeout(() => {
            const splash = document.getElementById('splash');
            if (splash) {
                splash.classList.add('hidden');
            }
        }, 1000);
        
        return loadRequestData;
    }
);

// Configure playback to add authentication headers
const playbackConfig = new cast.framework.PlaybackConfig();

// Intercept manifest requests to add authentication headers
playbackConfig.manifestRequestHandler = (requestInfo) => {
    console.log('[Receiver] Manifest request:', requestInfo.url);
    
    if (currentCustomData) {
        requestInfo.headers = requestInfo.headers || {};
        
        if (currentCustomData.userid) {
            requestInfo.headers['userid'] = currentCustomData.userid;
            console.log('[Receiver] Added userid header:', currentCustomData.userid);
        }
        if (currentCustomData.authinfo) {
            requestInfo.headers['authinfo'] = currentCustomData.authinfo;
            console.log('[Receiver] Added authinfo header');
        }
        if (currentCustomData.usersessionid) {
            requestInfo.headers['usersessionid'] = currentCustomData.usersessionid;
            console.log('[Receiver] Added usersessionid header');
        }
    }
    
    return requestInfo;
};

// Intercept segment requests to add authentication headers
playbackConfig.segmentRequestHandler = (requestInfo) => {
    if (currentCustomData) {
        requestInfo.headers = requestInfo.headers || {};
        
        if (currentCustomData.userid) {
            requestInfo.headers['userid'] = currentCustomData.userid;
        }
        if (currentCustomData.authinfo) {
            requestInfo.headers['authinfo'] = currentCustomData.authinfo;
        }
        if (currentCustomData.usersessionid) {
            requestInfo.headers['usersessionid'] = currentCustomData.usersessionid;
        }
    }
    
    return requestInfo;
};

playerManager.setPlaybackConfig(playbackConfig);

// Player event listeners
playerManager.addEventListener(
    cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
    () => {
        console.log('[Receiver] Player loaded successfully');
        showStatus('Playing');
    }
);

playerManager.addEventListener(
    cast.framework.events.EventType.ERROR,
    (event) => {
        console.error('[Receiver] Player error:', event.detailedErrorCode, event.error);
        showStatus('Error: ' + event.error.reason, true);
    }
);

playerManager.addEventListener(
    cast.framework.events.EventType.PLAYING,
    () => {
        console.log('[Receiver] Playback started');
        showStatus('Playing');
    }
);

playerManager.addEventListener(
    cast.framework.events.EventType.PAUSE,
    () => {
        console.log('[Receiver] Playback paused');
        showStatus('Paused');
    }
);

// Helper function to show status message
function showStatus(message, isError = false) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.classList.add('show');
        statusEl.style.background = isError ? 'rgba(244, 67, 54, 0.9)' : 'rgba(0, 0, 0, 0.7)';
        
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }
}

// Configure Cast options
const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600; // 1 hour
options.statusText = 'AIS Stream Player Ready';

// Start the receiver
context.start(options);

console.log('[Receiver] AIS Stream Custom Receiver initialized');
console.log('[Receiver] Version: 1.0.0');
console.log('[Receiver] Ready to receive media with custom headers');
