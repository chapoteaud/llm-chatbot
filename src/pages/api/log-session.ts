import { NextApiRequest, NextApiResponse } from 'next'
import requestIp from 'request-ip'
import { logToSplunk } from '../../lib/splunkLogger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const ip = requestIp.getClientIp(req) || 'Unknown'
    const userAgent = req.headers['user-agent'] || 'Unknown'
    
    const logData = {
      ...req.body,
      ip,
      userAgent,
      serverTimestamp: new Date().toISOString()
    };

    try {
      await logToSplunk(logData);
      res.status(200).json({ message: 'Session logged successfully to Splunk' })
    } catch (error) {
      console.error('Failed to log to Splunk:', error);
      res.status(500).json({ message: 'Failed to log session' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}