import React from 'react'

type params =  {
    bgcolor: string,
    progress: number,
    height: string
}

const Progress_bar = ({bgcolor,progress,height}:params) => { 
	
	const Parentdiv = { 
		height: height, 
		width: '100%', 
		backgroundColor: 'whitesmoke', 
		borderRadius: 40, 
	} 
	
	const Childdiv = { 
		height: '100%', 
		width: `${progress}%`, 
		backgroundColor: bgcolor, 
	borderRadius:40, 
		textAlign: 'right'
	} 
	
	const progresstext = { 
		padding: 10, 
		color: 'white', 
		fontWeight: 900 
	} 
		
	return ( 
	<div style={Parentdiv}> 
	<div style={Childdiv}> 
		<span style={progresstext}>{`${progress}%`}</span> 
	</div> 
	</div> 
	) 
} 

export default Progress_bar; 
