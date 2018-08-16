const constants = {
  COLUMN_DISPLAY_NAMES: {
    campaignId: "Campaign ID",
    campaignName: "Campaign Name",
    variantName: "Variant Name",
    tags: "Tags",
    channel: "Channel",
    subjectMessage: "Message/Subject",
    firstSent: "First Send (EST)",
    lastSentDateOnly: "Date",
    lastSentTimeOnly: "Time",
    lastSent: "DateTime",
    sent: "Sent",
    opens: "Opens",
    unique_opens: "Unique Opens",
    clicks: "Clicks",
    unique_clicks: "Unique Clicks",
    unsubscribes: "Unsubscribes",
    bounces: "Bounces",
    delivered: "Deliveries",
    reported_spam: "Spam",
    errors: "Webhook Errors",
    direct_opens: "Direct Opens",
    total_opens: "Total Opens",
    body_clicks: "Body Clicks",
    impressions: "Impressions",
    first_button_clicks: "First Button Clicks",
    second_button_clicks: "Second Button Clicks",
    unique_recipients: "Unique Recipients",
    conversions: "Conversions"
  },
  PUSH_CHANNELS: [
    "android_push",
    "apple_push",
    "kindle_push",
    "windows_phone8_push",
    "windows_universal_push",
    "web_push",
    "ios_push",
    "android_china_push"
  ],
  CHANNELS_DISPLAY: {
    "push": "Push",
    "email": "Email",
    "trigger_in_app_message": "In-App Message",
    "webhook": "Webhook",
    "in_app_message": "Original In-App Message"
  },
  COMBINED_PUSH: "push",
  COLUMNS_AT_END_OF_TABLE: ["tags", "channel"],
  COLUMNS_EXCLUDE_FROM_TABLE: ["lastSent"]
}

export default constants;
