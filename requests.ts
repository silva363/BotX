import axios from 'axios';
import querystring from 'querystring';

export async function Get(url: string, headers: {}, body: {}): Promise<any> {
    try {
        let finalUrl = `${url}`;

        if (Object.keys(body).length > 0) {
            finalUrl = `${finalUrl}?${querystring.stringify(body)}`;
        } 

        const response = await axios.get(
            finalUrl, {
            headers: headers
        });

        console.log('GET response:', response.data);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('POST error:', error.message);
            throw error.message;
        } else {
            console.error('POST error:', error);
            throw 'erro desconhecido';
        }
    }
}

export async function Post(url: string, data: any, headers: {}): Promise<any> {
    try {
        const response = await axios.post(
            url,
            JSON.stringify(data), {
            headers: headers
        });

        console.log('POST response:', response.data);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('POST error:', error.message);
            throw error.message;
        } else {
            console.error('POST error:', error);
            throw 'erro desconhecido';
        }
    }
}