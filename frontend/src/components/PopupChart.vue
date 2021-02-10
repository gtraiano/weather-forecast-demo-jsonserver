<template>
<div class="popup">
    <b-card no-body>
        <!-- no data to show -->
        <b-container
            v-if="status === 'error'"
            class="plot"
        >
            <div class="row justify-content-center">
                <div class="col-12 text-center">
                    <h3>{{$t('no data')}}</h3>
                </div>
            </div>
            <div class="row justify-content-center align-items-end">
                <div class="col-12 text-center align-self-end">
                    <b-icon-x-circle scale=12 shift-v="-120%" />
                </div>
            </div>
        </b-container>
        
        <!-- loading -->
        <b-container
            v-else-if="status === 'loading'"
            class="plot"
        >
            <div class="row justify-content-center">
                <div class="col-12 text-center">
                    <h3>{{$t('loading')}}</h3>
                </div>
            </div>
        </b-container>
        
        <!-- render plot only if popup is active -->
        <b-tabs
            v-else-if="status === 'ready' && active"
            pills
            justified
        >
        	<b-tab
                no-body
                v-for="(variable, index) in forecastVariables"
                :key="index"
                :title="$t(variable)"
            >
        		<b-container style="overflow: auto;">
        			<b-row class="p-0">
                        <b-col
                            md="12"
                            class="p-0 m-0 b-0 plot"
                            align="center"
                            v-bind:id="'container' + index"
                            @wheel.prevent="!openMenu && $emit('wheel', $event, index)"
                            @dragstart.prevent
                            v-on:mousedown = "dragStart($event)"
                            v-on:mouseup = "dragStop($event)"
                            v-on:mousemove = "dragOn($event, index)"
                        >
                            <!-- buttons functional only when mouse is hovering and/or no plot dragging occurs -->
                            <b-button-group
                                v-if="!dragging || showToolbar"
                                id="toolbar"
                                size="sm" class="button-group smooth slow"
                                v-bind:style="{opacity: showToolbar}"
                                @mouseenter="showToolbar = 1 || openMenu;"
                                @mouseleave="showToolbar = 0 || openMenu;"
                            >
                                <!-- zoom in-->
                                <b-button
                                    variant="light"
                                    @click="zoom(0.2, index);"
                                >
                                    <b-icon-zoom-in/>
                                </b-button>
                                <!-- zoom out-->
                                <b-button
                                    variant="light"
                                    @click="zoom(-0.2, index);"
                                >
                                    <b-icon-zoom-out/>
                                </b-button>
                                <!-- reset zoom -->
                                <b-button
                                    variant="light"
                                    @click="reset([index]);"
                                >
                                    <b-icon-arrow-clockwise/>
                                </b-button>
                                <!-- save plot image -->
                                <b-dropdown
                                    id="toolbar-save-image"
                                    size="sm"
                                    variant="light"
                                    @shown="openMenu = 1"
                                    @hidden="openMenu = 0"
                                >
                                    <template v-slot:button-content>
                                        <b-icon-download/>
                                    </template>
                                    <b-dropdown-header>
                                        {{$t('size')}}
                                    </b-dropdown-header>
                                    <b-dropdown-item
                                        v-for="(size, index) in [$t('small'), $t('normal'), $t('large')]"
                                        :key="index"
                                        class="container-fluid p-0 m-0"
                                        size="sm"
                                        :style="{'font-size': 75+'%'}"
                                        @click="saveImage(variable, Math.pow(2, index))"
                                    >
                                        {{size}}
                                    </b-dropdown-item>
                                </b-dropdown>
                            </b-button-group>
                            
                            <!-- plot -->
                            <LineChart
                                :styles="{height: '100%', width: '100%'}"
                                :chart-data="data.variables[variable]"
                                :scale="zoomScale[index]"
                                class="zoomable smooth fix-blur"
                                v-bind:style="{
                                    transform: 'scale(' + zoomScale[index] + ')',
                                    cursor: dragging && zoomScale[index] > 1.0 ? 'grab' : 'auto'
                                }"
                                :ref="variable"
                            />
                        </b-col>
                    </b-row>
        		</b-container>
        	</b-tab>
        </b-tabs>
    </b-card>
</div>
</template>

<script type = "text/javascript">
import Vue from 'vue';
import LineChart from './LineChart.vue';
import { BIconDownload, BIconZoomIn, BIconZoomOut, BIconArrowClockwise, BIconXCircle } from 'bootstrap-vue';

export default {
    name: 'PopupChart',

    props: {
        chartData: { // city forecast data
            type: Promise,
            required: true
        },
        active: { // popup active flag (if set, renders plot immediately on chartData changes)
            type: Boolean,
            required: false,
            default: true
        }
    },

    components: {
        LineChart,
        BIconDownload,
        BIconZoomIn,
        BIconZoomOut,
        BIconArrowClockwise,
        BIconXCircle
    },

    data: function() {
        return {
            zoomScale: [1.0, 1.0, 1.0], /* zoom scale for each tab container */
            dragCoord: { /* dragging start and end coordinations */
                start: {
                    x: 0, y: 0
                },
                end: {
                    x: 0, y: 0
                }
            },
            dragging: false, /* dragging state */
            showToolbar: 0, /* toolbar opacity */
            openMenu: 0, /* download menu is open */
            data: null,
            status: null
        }
    },

    computed: {
        forecastVariables: function() {
        /* returns a list of plot variables */
            return Object.keys(this.data.variables);
        }
    },

    methods: {
        zoom: function(amount, index) {
        /* increase zoomScale[index] by given amount */
            let val = Math.round((this.zoomScale[index] + amount + Number.EPSILON) * 100) / 100; // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
            val = val >= 1.0 ? val : 1.0;
            Vue.set(this.zoomScale, index, val);
        },

        reset: function(index) {
        /* set zoom scale to 1.0 for given indices */
            index.forEach(i => Vue.set(this.zoomScale, i, 1.0));
            this.dragging = false;
        },

        dragStart: function(event) {
        /* set dragging on and save initial mouse coordinations */
            if(event.which == 1) { /* only on left click */
                this.dragging = true;
                this.dragCoord.start.x = event.layerX;
                this.dragCoord.start.y = event.layerY;
                this.openMenu = 0; // close download menu and start dragging
            }
        },

        dragOn: function(event, index) {
        /* update coordinations while dragging and scroll image */
            if(this.dragging && event.buttons && event.which == 1) { /* check left click and dragging */
                this.showToolbar = 0; // force hide toolbar
                
                let container = this.$el.querySelector("#container" + index); // contains the chart
                if (event.target != container) { // scroll image only when mouse pointer within container bounds
                    this.dragCoord.end.x = event.layerX;
                    this.dragCoord.end.y = event.layerY;
                    container.scrollLeft -= this.dragCoord.end.x - this.dragCoord.start.x;
                    container.scrollTop -= this.dragCoord.end.y - this.dragCoord.start.y;
                }
            }
        },

        dragStop: function(event) {
        /* stops dragging action */
            if(event.which == 1)
                this.dragging = false;
        },

        saveImage(variable, scale = 1) {
            window.open(this.$refs[variable][0].exportImage(scale));
        },

        onWheel: function(event, index) {
            this.zoom(Math.sign(-event.deltaY)*0.2, index);
        }
    },

    watch: {
        async chartData(newValue, oldValue) {
            this.status = 'loading';
            try {
                this.data = await newValue;
                this.status = 'ready'
            }
            catch(error) {
                this.status = 'error';
            }
        }

    },

    async created() {
        this.status = 'loading';
        try {
            this.data = await this.chartData;
            this.status = 'ready'
        }
        catch(error) {
            this.status = 'error'
        }
    },

    mounted() {
        /* listen to wheel events for zooming */
        //this.$on('wheel', (event, index) => { this.zoom(Math.sign(-event.deltaY)*0.2, index); });
        this.$on('wheel', this.onWheel);
    },

    destroyed() {
        this.$off();
    }
};
</script>

<style scoped>
.popup {
    width: 345px;
    min-height: 309px;
}

.zoomable {
    position: static;
    transform-origin: 0 0;
}

.smooth {
    transition: all;
    transition-duration: 0.05s;
    transition-timing-function: ease-in;
}

.smooth.slow {
    transition-duration: 0.3s;
}

.plot {
    height: 275px;
    overflow: auto;
}

.fix-blur {
/* fixes blurring issues when scaling (https://github.com/chartjs/Chart.js/issues/2814) */
    image-rendering: optimizeSpeed;             /* Older versions of FF */
    image-rendering: -moz-crisp-edges;          /* FF 6.0+ */
    image-rendering: -webkit-optimize-contrast; /* Webkit (non standard naming) */
    image-rendering: -o-crisp-edges;            /* OS X & Windows Opera (12.02+) */
    image-rendering: crisp-edges;               /* Possible future browsers. */
    -ms-interpolation-mode: nearest-neighbor;   /* IE (non standard naming) */
}

.button-group {
    z-index: 1;
    position: fixed;
    top: 55px;
    left: 30px;
}

*:focus {
    outline: none;
    box-shadow: none;
}
</style>