import React, { useState, useEffect } from 'react'
import Loadingpage from './Loadingpage'

const Chatbot = () => {

    const [input, setinput] = useState("")
    const [messages, setMessages] = useState([])
    const [loadingP, setLoadingP] = useState(true)
    const [loading, setLoading] = useState(false)
    const [sources, setSources] = useState([])
    const [selectedSource, setSelectedSource] = useState(null)

    setTimeout(() => {
        setLoadingP(false)
    }, 2000);

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/sources")
                if (!res.ok) throw new Error("Failed to fetch sources")
                const data = await res.json()
                setSources(data)
                setMessages ((prev) => [...prev, { sender : "bot" , text :"Now choose a major" }])
            } catch (err) {
                console.log(err)
                setMessages((prev) => [...prev, { sender: "bot", text: "Error fetching sources. Please try again later." }])
            } 
        }
        fetchSources()
    }, [])

    const clearChat = () => {
        setMessages([]);
        setMessages((prev) => [...prev, { sender: "bot", text: `Now choose a major.` }]);
    }

    const selectSource = async (sourceName) => {
        try {
            console.log(`Attempting to select source: ${sourceName}`);
            const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/select_source", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_name: sourceName })
            });
            console.log(`Response status: ${res.status}`);
            if (res.ok) {
                setSelectedSource(sourceName);
                setMessages((prev) => [...prev, { sender: "bot", text: `Selected source: ${sourceName}, You can now generate a question.` }]);
                console.log(`Source successfully selected: ${sourceName}, You can now generate a question.`);
            } else {
                const errorData = await res.json();
                console.error("Error selecting source:", errorData);
                throw new Error(errorData.message || "Failed to select source");
            }
            setLoading(false)
        } catch (err) {
            console.error("Error in selectSource function:", err);
            setMessages((prev) => [...prev, { sender: "bot", text: "Error selecting source. Please try again." }]);
            setLoading(false)
        } 
    }

    const generateQuestion = async () => {
        if (!selectedSource) {
            setMessages((prev) => [...prev, { sender:"bot", text:"Please select a source first." }])
            return
        }
        try {
            const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/generate_question")
            const data = await res.json()
            setMessages((prev) => [...prev, { sender:"bot", text:data.question || "No question generated." }])
            setLoading(false)
        } catch (err) {
            console.log(err)
            setLoading(false)
        } 
    }

    const submitAnswer = async () => {
        if (!input.trim()) return
        const userMsg = { sender:'user', text:input }
        setMessages((prev) => [...prev, userMsg])
        setinput("")
        setLoading(true)
        try {
            const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/submit_answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer: input })
            })
            const data = await res.json()
            const botMsg = { 
                sender:"bot", 
                text: data.feedback ? `${data.feedback}\nScore: ${data.score}, Please clear the chat and start over.` : "No evaluation received." 
            } 
            setLoading(false)
            setMessages((prev) => [...prev, botMsg])
        } catch (err) {
            console.log(err)
            setMessages((prev) => [...prev, { sender:"bot", text:"Error getting response. Try again." }])
            setLoading(false)
        } 
    }
    

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            submitAnswer()
        }
    }

    return (
        <section className='relative min-h-[calc(100vh-72px)] bg-pri p-16 flex items-center flex-col'>
            {loadingP && (
                <Loadingpage />
            )}
            <div className='w-full h-[625px] bg-[#0e1617] rounded-3xl p-6 gap-5 flex flex-col relative'>
                <div className='mb-2 flex flex-wrap justify-between'>
                    <div className='flex gap-2 flex-wrap'> 
                    {sources.map((src, i) => (
                        <button key={i} onClick={() => {selectSource(src); setLoading(true)}} className={`px-3 py-1 rounded ${selectedSource===src ? "bg-[#0e898e]" : "bg-gray-600"}`}>
                            {src}
                        </button>

                    ))}
                    </div>
                    <button onClick={generateQuestion} className='px-3 py-1 bg-green-600 rounded'>Generate Question</button>
                </div>
                <div className=' w-full h-[500px] border-solid border-white border-[2px] rounded-3xl p-5 overflow-auto'>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-sec text-white' : 'bg-gray-300 text-black'}`}>
                                {msg.text}
                            </div>
                        </div> 
                    ))}
                    { loading && 
                        <div className={`flex justify-start mb-2 mt-3 ml-1`}>
                            <div className={`w-2 h-2 rounded-full bg-gray-300 text-black animate-ping`}>
                            
                            </div>
                        </div> 
                    }
                </div>
                <div className='flex flex-col gap-2 '>
                    <div className='flex items-center contain-content gap-2'>
                    <input
                    className=' w-full h-[30px] p-2 rounded-3xl border-none focus:border-none' 
                    type="text"
                    name='massage'
                    placeholder="Type your answer..."
                    value={input}
                    onChange={(e) => setinput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    />
                    </div>
                    <div className='flex gap-2 '>
                    <button 
                    onClick={submitAnswer} 
                    className={`w-full h-[30px] text-[16px] text-white bg-[#0e898e] rounded-3xl hover:bg-[#172627] transition-all ease-in duration-300 ${!input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    disabled={!input.trim()}>
                        Send Answer
                    </button>
                        <button 
                        onClick={clearChat} 
                        className=' w-full h-[30px] text-[16px] text-white bg-[#0e898e] rounded-3xl hover:bg-[#172627] transition-all ease-in duration-300' >
                        Clear
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Chatbot
