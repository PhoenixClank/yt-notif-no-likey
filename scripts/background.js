function notificationMenuItemFilter(item) {
	return !(Object.hasOwn(item, "notificationRenderer") && item.notificationRenderer.shortMessage.simpleText.startsWith("👍 Someone liked your comment"));
}

browser.webRequest.onBeforeRequest.addListener(details => {
	const filter = browser.webRequest.filterResponseData(details.requestId);
	const decoder = new TextDecoder();
	var str = "";
	filter.ondata = event => {
		str += decoder.decode(event.data);
	};
	filter.onstop = () => {
		const response = JSON.parse(str);
		if (Object.hasOwn(response.onResponseReceivedEndpoints[0], "openPopupAction")) for (const section of response.onResponseReceivedEndpoints[0].openPopupAction.popup.multiPageMenuRenderer.sections) {
			const temp = section.multiPageMenuNotificationSectionRenderer.items.filter(notificationMenuItemFilter);
			section.multiPageMenuNotificationSectionRenderer.items = temp;
		} else {
			const temp = response.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems.filter(notificationMenuItemFilter);
			response.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems = temp;
		}
		filter.write(new TextEncoder().encode(JSON.stringify(response)));
		filter.close();
	}
	return {};
}, {urls: ["https://www.youtube.com/youtubei/v1/browse", "https://www.youtube.com/youtubei/v1/browse?*"]}, ["blocking"]);
