<template>
	<view>
		<view class="content">
			<image class="logo" src="/static/image/用户页头像.jpg"></image>
			<view class="text-area">
				<text class="title">{{title}}</text>
			</view>
		</view>
		<view>
		<uni-list>
			 <uni-list-item title="问卷记录"  showArrow thumb="/static/image/记录.png" thumb-size="base" clickable @click="" />
			 <uni-list-item title="清除问卷"  showArrow thumb="/static/image/laji.png" thumb-size="base" clickable @click="" />
		</uni-list>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return {
				title: '个人信息',
				src: '' 
			}
		},
	}
	
</script>

<style>
	.content {  
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 70rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
		border-radius: 200px;
	}
	
	.text-area {
		margin-bottom: 40rpx;
		display: flex;
		justify-content: center;
	}
	
	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>