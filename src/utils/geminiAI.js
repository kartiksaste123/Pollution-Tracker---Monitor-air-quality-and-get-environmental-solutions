import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyBTUY2DFNcNlzVm0apPstfK8PCA--K_HMw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const getEnvironmentalSolutions = async (cityData) => {
    try {
        const prompt = `
        As an environmental expert, provide specific solutions and recommendations for improving air quality in ${cityData.name}, India.
        Current conditions:
        - AQI (Air Quality Index): ${cityData.aqi}
        - Status: ${cityData.status}
        ${cityData.iaqi ? `
        Additional measurements:
        ${Object.entries(cityData.iaqi)
            .map(([key, value]) => `- ${key.toUpperCase()}: ${value.v}`)
            .join('\n')}
        ` : ''}

        Please provide:
        1. Immediate actions for individuals
        2. Community-level initiatives
        3. Long-term policy recommendations
        4. Health precautions
        5. Environmental impact reduction strategies
        
        Format the response in clear, concise bullet points. Do not use asterisks (*) or other special formatting characters. Use simple bullet points (•) only.`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }
        );

        // Parse and structure the response
        const solutions = response.data.candidates[0].content.parts[0].text;
        
        // Clean up the response:
        // 1. Remove asterisks
        // 2. Ensure proper bullet points
        // 3. Remove empty lines
        // 4. Format section headers properly
        return solutions
            .split('\n')
            .map(line => {
                // Remove asterisks and extra spaces
                let cleanLine = line.replace(/\*/g, '').trim();
                
                // Add bullet points to list items if they don't start with numbers or section headers
                if (cleanLine && 
                    !cleanLine.match(/^\d+\./) && // not numbered
                    !cleanLine.match(/^[A-Z][A-Za-z\s]+:/) && // not a section header
                    !cleanLine.match(/^•/) // doesn't already have a bullet
                ) {
                    cleanLine = '• ' + cleanLine;
                }
                
                return cleanLine;
            })
            .filter(line => line.trim()) // Remove empty lines
            .map(line => {
                // Make section headers bold using CSS classes
                if (line.match(/^[A-Z][A-Za-z\s]+:/)) {
                    return `<h6 class="mt-3 mb-2">${line}</h6>`;
                }
                return line;
            });
    } catch (error) {
        console.error('Error fetching environmental solutions:', error);
        return [
            "• Use masks when going outside",
            "• Keep windows closed during high pollution hours",
            "• Use air purifiers indoors",
            "• Avoid outdoor exercise when AQI is high",
            "• Consider carpooling or public transport",
            "• Plant air-purifying plants in your home"
        ];
    }
}; 