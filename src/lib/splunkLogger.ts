const splunkConfig = {
  hecUrl: process.env.SPLUNK_HEC_URL,
  hecToken: process.env.SPLUNK_HEC_TOKEN,
  index: 'llm_chatbot_index',
  sourcetype: 'llm_chatbot_logs',
};

export async function logToSplunk(data: any) {
  if (!splunkConfig.hecUrl || !splunkConfig.hecToken) {
    console.error('Splunk HEC URL or token is not configured');
    return;
  }

  const eventData = {
    event: data,
    sourcetype: splunkConfig.sourcetype,
    index: splunkConfig.index,
  };

  try {
    const response = await fetch(splunkConfig.hecUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Splunk ${splunkConfig.hecToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Log sent to Splunk successfully');
  } catch (error) {
    console.error('Error sending log to Splunk:', error);
  }
}