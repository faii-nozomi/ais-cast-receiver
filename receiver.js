/**
 * AIS Stream Custom Cast Receiver
 * Supports custom HTTP headers for authentication
 */

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const playbackConfig = new cast.framework.PlaybackConfig();

// Configure player for HLS with custom headers
playbackConfig.manifestRequestHandler = (requestInfo) => {
    console.log('[Receiver] Manifest request:', requestInfo.url);
    
    // Add custom headers from media metadata
    if (requestInfo.content && requestInfo.content.customData) {
        const customData = requestInfo.content.customData;
        
        if (customData.userid) {
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['userid'] = customData.userid;
            console.log('[Receiver] Added userid header:', customData.userid);
        }
        
        if (customData.authinfo) {
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['authinfo'] = customData.authinfo;
            console.log('[Receiver] Added authinfo header');
        }
        
        if (customData.usersessionid) {
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers['usersessionid'] = customData.usersessionid;
            console.log('[Receiver] Added usersessionid header');
        }
    }
    
    return requestInfo;
};

// Handle segment requests (video chunks)
playbackConfig.segmentRequestHandler = (requestInfo) => {
    // Add custom headers to segment requests too
    if (requestInfo.content && requestInfo.content.customData) {
        const customData = requestInfo.content.customData;
        
        requestInfo.headers = requestInfo.headers || {};
        
        if (customData.userid) {
            requestInfo.headers['userid'] = customData.userid;
        }
        if (customData.authinfo) {
            requestInfo.headers['authinfo'] = customData.authinfo;
        }
        if (customData.usersessionid) {
            requestInfo.headers['usersessionid'] = customData.usersessionid;
        }
    }
    
    return requestInfo;
};

// Set playback config
context.setPlaybackConfig(playbackConfig);

// Handle LOAD interceptor to extract custom data
playerManager.setMessageInterceptor(
    cast.framework.messages.MessageType.LOAD,
    (loadRequestData) => {
        console.log('[Receiver] LOAD request received');
        console.log('[Receiver] Media URL:', loadRequestData.media.contentUrl);
        
        if (loadRequestData.media.customData) {
            console.log('[Receiver] Custom data:', loadRequestData.media.customData);
            
            // Store custom data for later use
            loadRequestData.media.customData = {
                userid: loadRequestData.media.customData.userid,
                authinfo: loadRequestData.media.customData.authinfo,
                usersessionid: loadRequestData.media.customData.usersessionid
            };
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
