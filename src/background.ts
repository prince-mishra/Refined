import availablePlugins from "./available_plugins";

chrome.runtime.onInstalled.addListener(d => {
    chrome.storage.sync.get(["acceptedRisks", "settings", "pluginSettings"], res => {
        if (!res.acceptedRisks) {
            chrome.tabs.create({ url: chrome.extension.getURL("options.html") + "?fullpage=1" });
        }

        if (!res.pluginSettings) {
            let pluginSettings = {};
            if (res.settings) {
                // it needs an update!
                const settings = JSON.parse(res.settings);
                pluginSettings = {
                    hideUsers: {
                        enabled: true,
                        hidden_ids: settings.hidden_ids ? settings.hidden_ids.split(",").map(s => `*.${s.trim()}`) : []
                    },
                    hangouts: {
                        enabled: !!(settings.hangout_url && settings.hangout_url.length > 0),
                        url: settings.hangout_url
                    },
                    markdownLinks: {
                        enabled: true
                    },
                    unreadOnTitle: {
                        enabled: !!settings.unread_on_title
                    },
                    unreadOnFavicon: {
                        enabled: false
                    },
                    threadToChannel: {
                        enabled: !!settings.threads_on_channel
                    },
                    maintainThreadToChannel: {
                        enabled: true
                    },
                    moveReactions: {
                        enabled: !!settings.reactions_on_the_right
                    },
                    hideStatusEmoji: {
                        enabled: !!settings.hide_status_emoji
                    },
                    hideUrlPreviews: {
                        enabled: !!settings.hide_url_previews
                    },
                    hideGDrivePreviews: {
                        enabled: !!settings.hide_gdrive_preview
                    },
                    moveSidebar: {
                        enabled: false
                    },
                    showDetailsOnChannelChange: {
                        enabled: false
                    },
                    postThreadMessagesOnChannel: {
                        enabled: false
                    },
                    hideAllUnreads: {
                        enabled: false
                    },
                    hideAllThreads: {
                        enabled: false
                    },
                };
            } else {
                // it"s a fresh install, load the defaults
                pluginSettings = {
                    hideUsers: {
                        enabled: true,
                        hidden_ids: []
                    },
                    hangouts: {
                        enabled: false
                    },
                    markdownLinks: {
                        enabled: true
                    },
                    unreadOnTitle: {
                        enabled: true
                    },
                    unreadOnFavicon: {
                        enabled: false
                    },
                    threadToChannel: {
                        enabled: false
                    },
                    maintainThreadToChannel: {
                        enabled: true
                    },
                    moveReactions: {
                        enabled: false
                    },
                    hideStatusEmoji: {
                        enabled: false
                    },
                    hideUrlPreviews: {
                        enabled: false
                    },
                    hideGDrivePreviews: {
                        enabled: false
                    },
                    doNotOpenLinksOnApp: {
                        enabled: false
                    },
                    moveSidebar: {
                        enabled: false
                    },
                    showDetailsOnChannelChange: {
                        enabled: false
                    },
                    changeBoldAndItalics: {
                        enabled: false
                    },
                    hideAllUnreads: {
                        enabled: false
                    },
                    hideAllThreads: {
                        enabled: false
                    },
                };
            }
            chrome.storage.sync.set({
                pluginSettings: JSON.stringify(pluginSettings)
            });
        } else {
            let pluginUpdated = false;
            const pluginSettings = JSON.parse(res.pluginSettings);

            // new plugins
            if (pluginSettings.unreadOnFavicon === undefined) {
                pluginUpdated = true;
                pluginSettings.unreadOnFavicon = { enabled: false };
            }
            if (pluginSettings.moveSidebar === undefined) {
                pluginUpdated = true;
                pluginSettings.moveSidebar = { enabled: false };
            }
            if (pluginSettings.showDetailsOnChannelChange === undefined) {
                pluginUpdated = true;
                pluginSettings.showDetailsOnChannelChange = { enabled: false };
            }
            if (pluginSettings.postThreadMessagesOnChannel === undefined) {
                pluginUpdated = true;
                pluginSettings.postThreadMessagesOnChannel = { enabled: false };
            }
            if (pluginSettings.changeBoldAndItalics === undefined) {
                pluginUpdated = true;
                pluginSettings.changeBoldAndItalics = { enabled: false };
            }
            if (pluginSettings.hideAllUnreads === undefined) {
                pluginUpdated = true;
                pluginSettings.hideAllUnreads = { enabled: false };
                pluginSettings.hideAllThreads = { enabled: false };
            }

            if (pluginUpdated) {
                chrome.storage.sync.set({
                    pluginSettings: JSON.stringify(pluginSettings)
                });
            }
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "slackPageOpened") {
        chrome.pageAction.show(sender.tab.id);
    } else if (request.type === "closeThisTab") {
        chrome.tabs.remove(sender.tab.id);
    } else if (request.type.startsWith("refined.")) {
        const parts = request.type.split(".");
        const potentialClass = availablePlugins[parts[1]];

        if (potentialClass) {
            request.type = parts[2];
            potentialClass.ProcessExtensionMessage(request, parts[1], sender);
        }
    }
});
