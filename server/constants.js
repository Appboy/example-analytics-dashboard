const constants = {
  // All possible push channels.
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
  // Channel name for combining info for above channels
  COMBINED_PUSH: "push",
  // Values sent down for variants excluding stats (sends, opens, etc)
  // Put these in the order you want them to display on the grid / csv
  META_DATA_VALUES_TO_SHOW: [
    "subjectMessage",
    "lastSentDateOnly",
    "lastSentTimeOnly",
    "lastSent",
    "variantName",
    "tags",
    "channel",
    "campaignName"
  ],
  STAT_TYPES: [
    "sent",
    "unique_recipients",
    "opens",
    "unique_opens",
    "clicks",
    "unique_clicks",
    "unsubscribes",
    "bounces",
    "delivered",
    "reported_spam",
    "errors",
    "direct_opens",
    "total_opens",
    "body_clicks",
    "impressions",
    "first_button_clicks",
    "second_button_clicks",
    "conversions"
  ],
  STAT_PERCENTAGE_DENOMENATORS: {
    opens: "unique_recipients",
    unique_opens: "unique_recipients",
    clicks: "unique_recipients",
    unique_clicks: "unique_recipients",
    unsubscribes: "unique_recipients",
    bounces: "sent",
    delivered: "sent",
    reported_spam: "sent",
    errors: "sent",
    direct_opens: "unique_recipients",
    total_opens: "unique_recipients",
    body_clicks: "unique_recipients",
    impressions: "unique_recipients",
    first_button_clicks: "unique_recipients",
    second_button_clicks: "unique_recipients",
    conversions: "unique_recipients"
  },
  // Stats that should not have percentages generated for them.
  EXCLUDE_PERCENTAGES: ["sent", "unique_recipients"]
}

module.exports = constants;
