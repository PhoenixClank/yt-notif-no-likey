const re = /^👍 Someone liked your (?:comment|reply)/u;

function notificationMenuItemFilter(item) {
	return !(Object.hasOwn(item, "notificationRenderer") && re.test(item.notificationRenderer.shortMessage.simpleText));
}

browser.webRequest.onBeforeRequest.addListener(details => {
	const filter = browser.webRequest.filterResponseData(details.requestId);
	const decoder = new TextDecoder();
	var str;
	filter.onstart = () => {
		str = "";
	}
	filter.ondata = event => {
		str += decoder.decode(event.data);
	};
	filter.onstop = () => {
		const response = JSON.parse(str);
		if (Object.hasOwn(response, "onResponseReceivedEndpoints")) {
			if (
				Object.hasOwn(response.onResponseReceivedEndpoints[0], "openPopupAction")
				&& Object.hasOwn(response.onResponseReceivedEndpoints[0].openPopupAction.popup, "multiPageMenuRenderer")
				&& response.onResponseReceivedEndpoints[0].openPopupAction.popup.multiPageMenuRenderer.style == "MULTI_PAGE_MENU_STYLE_TYPE_NOTIFICATIONS"
			) for (const section of response.onResponseReceivedEndpoints[0].openPopupAction.popup.multiPageMenuRenderer.sections) {
				const temp = section.multiPageMenuNotificationSectionRenderer.items.filter(notificationMenuItemFilter);
				section.multiPageMenuNotificationSectionRenderer.items = temp;
			} else if (
				Object.hasOwn(response.onResponseReceivedEndpoints[0], "appendContinuationItemsAction")
				&& response.onResponseReceivedEndpoints[0].appendContinuationItemsAction.target == "CONTINUATION_TARGET_NOTIFICATION_MENU"
			) {
				const temp = response.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems.filter(notificationMenuItemFilter);
				response.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems = temp;
			}
		}
		filter.write(new TextEncoder().encode(JSON.stringify(response)));
		filter.close();
	}
	return {};
}, {urls: ["https://www.youtube.com/youtubei/v1/browse", "https://www.youtube.com/youtubei/v1/browse?*"]}, ["blocking"]);
