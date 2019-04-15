import React from 'react'
import Gallery from 'react-grid-gallery'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import imgs from '../utils/grid-gallery-data.json'

// const imgs = [
// {
// src: '../static/images/IMG_20190317_161356__01.jpg',
// thumbnail: '../static/images/IMG_20190317_161356__01.jpg',
// thumbnailWidth: 180,
// thumbnailHeight: 240,
// },
// {
// src: '../static/images/IMG_20190318_105444.jpg',
// thumbnail: '../static/images/IMG_20190318_105444.jpg',
// thumbnailWidth: 180,
// thumbnailHeight: 240,
// },
// {
// src: '../static/images/IMG_20190318_150649.jpg',
// thumbnail: '../static/images/IMG_20190318_150649.jpg',
// thumbnailWidth: 240,
// thumbnailHeight: 180,
// },
// ]

const styles = theme => ({
	page: {
		backgroundColor: theme.palette.background.default,
	},
	appBar: {
		position: 'relative',
	},
	container: {
		backgroundColor: theme.palette.background.paper,
		maxWidth: 'calc(58 * 1rem)',
		margin: '0 auto',
		overflow: 'auto', // prevent float collapsing
	},
	title: {
		padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
	},
})

const Index = ({ classes }) => (
	<div className={classes.page}>
		<AppBar className={classes.appBar}>
			<Toolbar>
				<Typography variant="h6" component="span" color="inherit">
					Iceland 2019
				</Typography>
			</Toolbar>
		</AppBar>
		<Typography className={classes.title} variant="h1" align="center">
			Iceland 2019
		</Typography>
		<div className={classes.container}>
			<Gallery images={imgs} />
		</div>
	</div>
)

Index.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Index)
