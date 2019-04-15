import React from 'react'
import App, { Container } from 'next/app'
import { MuiThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import JssProvider from 'react-jss/lib/JssProvider'
import getPageContext from '../utils/getPageContext'

export default class IcelandGallery extends App {
	constructor() {
		super()
		this.pageContext = getPageContext()
	}

	componentDidMount() {
		const jssStyles = document.querySelector('#jss-server-side')
		if (jssStyles && jssStyles.parentNode) {
			jssStyles.parentNode.removeChild(jssStyles)
		}
	}

	render() {
		const { Component, pageProps } = this.props
		return (
			<Container>
				<JssProvider
					registry={this.pageContext.sheetsRegistry}
					generateClassName={this.pageContext.generateClassName}
				>
					<MuiThemeProvider
						theme={this.pageContext.theme}
						sheetsManager={this.pageContext.sheetsManager}
					>
						<CssBaseline />
						<Component pageContext={this.pageContext} {...pageProps} />
					</MuiThemeProvider>
				</JssProvider>
			</Container>
		)
	}
}
