const sequelize = require('../database/connection');

module.exports = {
    // ========================================
    // ANALYTICS ENDPOINTS
    // ========================================

    getAnalyticsStats: (req, res) => {
        console.log('Getting analytics stats');
        sequelize.query(`
            WITH base_stats AS (
                SELECT
                    COUNT(DISTINCT c.channel_id) as total_channels,
                    COUNT(DISTINCT v.video_id) as total_videos,
                    COUNT(DISTINCT CASE WHEN c.saturation_score < 0.3 AND c.rev_sort > 2000 AND c.new_channel = true THEN c.channel_id END) as high_opportunity,
                    AVG(CASE WHEN c.new_channel = true THEN c.rev_sort END) as avg_revenue,
                    COUNT(DISTINCT CASE WHEN c.first_upload_date >= NOW() - INTERVAL '4 weeks' AND c.new_channel = true THEN c.channel_id END) as new_channels_four_weeks,
                    COUNT(DISTINCT CASE WHEN c.saturation_score < 0.3 AND c.new_channel = true THEN c.channel_id END) as low_saturation,
                    COUNT(DISTINCT CASE
                        WHEN c.sub_count_num IS NOT NULL
                        AND c.sub_count_num < 100000
                        AND EXISTS (
                            SELECT 1
                            FROM videos v2
                            WHERE v2.channel_url = c.channel_url
                            AND v2.views > 100000
                        )
                        THEN c.channel_id
                    END) as viral_small_channels
                FROM channel c
                LEFT JOIN videos v ON c.channel_url = v.channel_url
            )
            SELECT
                total_channels::int as total_channels,
                total_videos::int as total_videos,
                high_opportunity::int as high_opportunity_count,
                ROUND(avg_revenue::numeric, 2) as avg_revenue,
                new_channels_four_weeks::int as new_channels_four_weeks,
                low_saturation::int as low_saturation_count,
                viral_small_channels::int as viral_small_channels
            FROM base_stats
        `)
        .then(dbResult => {
            console.log(dbResult[0]);
            // Transform snake_case to camelCase for frontend
            const data = dbResult[0][0];
            const transformedData = {
                totalChannels: data.total_channels,
                totalVideos: data.total_videos,
                highOpportunityCount: data.high_opportunity_count,
                avgRevenue: data.avg_revenue,
                newChannelsFourWeeks: data.new_channels_four_weeks,
                lowSaturationCount: data.low_saturation_count,
                viralSmallChannels: data.viral_small_channels
            };
            console.log('Transformed data:', transformedData);
            res.status(200).send(transformedData);
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getAnalyticsChannels: (req, res) => {
        const limit = req.query.limit || 500;
        console.log('Getting analytics channels, limit:', limit);
        sequelize.query(`
            SELECT
                channel_id,
                channel_name,
                channel_url,
                saturation_score,
                rev_sort,
                niche_category,
                search_term,
                top_vid_copycats,
                revenue_last_month,
                first_upload_date,
                sub_count_num,
                views_last_month,
                EXTRACT(DAY FROM NOW() - first_upload_date)::int as days_old
            FROM channel
            WHERE new_channel = true
                AND first_upload_date IS NOT NULL
                AND saturation_score IS NOT NULL
                AND rev_sort IS NOT NULL
            ORDER BY first_upload_date DESC
            LIMIT ${limit}
        `)
        .then(dbResult => {
            console.log('Found', dbResult[0].length, 'channels');
            res.status(200).send(dbResult[0]);
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getAnalyticsNiches: (req, res) => {
        console.log('Getting niche analytics');
        sequelize.query(`
            SELECT
                COALESCE(niche_category, search_term, 'Uncategorized') as niche,
                COUNT(*)::int as channel_count,
                AVG(saturation_score)::numeric(6,3) as avg_saturation,
                AVG(rev_sort)::numeric as avg_revenue,
                AVG(COALESCE(top_vid_copycats, 0))::numeric as avg_copycats
            FROM channel
            WHERE new_channel = true
                AND (niche_category IS NOT NULL OR search_term IS NOT NULL)
            GROUP BY COALESCE(niche_category, search_term, 'Uncategorized')
            HAVING COUNT(*) >= 3
            ORDER BY avg_revenue DESC NULLS LAST
            LIMIT 50
        `)
        .then(dbResult => {
            console.log('Found', dbResult[0].length, 'niches');
            res.status(200).send(dbResult[0]);
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getOpportunities: (req, res) => {
        const { maxSaturation, minRevenue, maxCopycats, dateRange, niche } = req.query;
        console.log('Getting opportunities with filters:', req.query);

        const maxSat = maxSaturation || 0.5;
        const minRev = minRevenue || 1000;
        const maxCopy = maxCopycats || 50;
        const dateRng = dateRange || 2;

        let nicheFilter = '';
        if (niche && niche.trim() !== '') {
            nicheFilter = `AND (LOWER(niche_category) LIKE LOWER('%${niche}%') OR LOWER(search_term) LIKE LOWER('%${niche}%'))`;
        }

        sequelize.query(`
            SELECT
                channel_id,
                channel_name,
                channel_url,
                saturation_score,
                rev_sort,
                niche_category,
                search_term,
                top_vid_copycats,
                revenue_last_month,
                yearly_revenue,
                first_upload_date,
                sub_count,
                sub_count_num,
                views_last_month,
                rpm_low,
                rpm_high,
                EXTRACT(DAY FROM NOW() - first_upload_date)::int as days_old
            FROM channel
            WHERE new_channel = true
                AND first_upload_date >= NOW() - INTERVAL '${dateRng} months'
                AND saturation_score <= ${maxSat}
                AND COALESCE(rev_sort, 0) >= ${minRev}
                AND COALESCE(top_vid_copycats, 0) <= ${maxCopy}
                ${nicheFilter}
            ORDER BY
                (1 - COALESCE(saturation_score, 0.5)) * COALESCE(rev_sort, 0) DESC,
                first_upload_date DESC
            LIMIT 100
        `)
        .then(dbResult => {
            console.log('Found', dbResult[0].length, 'opportunities');
            res.status(200).send(dbResult[0]);
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getAllChannels: (req, res) => {
        console.log('Getting total channel count');
        sequelize.query(`SELECT COUNT(*) FROM channel`)
        .then(dbResult => {
            const totalChannels = parseInt(dbResult[0][0].count);
            console.log('Total channels:', totalChannels);
            res.status(200).send({ totalChannels });
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getAllVideos: (req, res) => {
        console.log('Getting total video count');
        sequelize.query(`SELECT COUNT(*) FROM videos`)
        .then(dbResult => {
            const totalVideos = parseInt(dbResult[0][0].count);
            console.log('Total videos:', totalVideos);
            res.status(200).send({ totalVideos });
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getNewChannels: (req, res) => {
        console.log('Getting new channels count (4 weeks)');
        sequelize.query(`
            SELECT COUNT(*)::int AS new_channels_count
            FROM public.channel c
            WHERE
                c.sub_count_num IS NOT NULL
                AND c.sub_count_num < 100000
                AND EXISTS (
                    SELECT 1
                    FROM public.videos v
                    WHERE v.channel_url = c.channel_url
                      AND v.views > 100000
                )
                AND c.not_interested IS FALSE
                AND c.first_upload_date >= (CURRENT_DATE - INTERVAL '4 weeks')
        `)
        .then(dbResult => {
            const newChannelsCount = dbResult[0][0]?.new_channels_count || 0;
            console.log('New channels (4 weeks):', newChannelsCount);
            res.status(200).send({ newChannelsCount });
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getViralChannels8w: (req, res) => {
        console.log('Getting viral channels count (8 weeks)');
        sequelize.query(`
            SELECT COUNT(*)::int AS viral_channels_count
            FROM public.channel c
            WHERE
                c.sub_count_num IS NOT NULL
                AND c.sub_count_num < 100000
                AND EXISTS (
                    SELECT 1
                    FROM public.videos v
                    WHERE v.channel_url = c.channel_url
                      AND v.views > 100000
                )
                AND c.not_interested IS FALSE
                AND c.first_upload_date >= (CURRENT_DATE - INTERVAL '8 weeks')
        `)
        .then(dbResult => {
            const viralChannels8wCount = dbResult[0][0]?.viral_channels_count || 0;
            console.log('Viral channels (8 weeks):', viralChannels8wCount);
            res.status(200).send({ viralChannels8wCount });
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    },

    getViralChannels12w: (req, res) => {
        console.log('Getting viral channels count (12 weeks)');
        sequelize.query(`
            SELECT COUNT(*)::int AS viral_channels_count
            FROM public.channel c
            WHERE
                c.sub_count_num IS NOT NULL
                AND c.sub_count_num < 100000
                AND EXISTS (
                    SELECT 1
                    FROM public.videos v
                    WHERE v.channel_url = c.channel_url
                      AND v.views > 100000
                )
                AND c.not_interested IS FALSE
                AND c.first_upload_date >= (CURRENT_DATE - INTERVAL '12 weeks')
        `)
        .then(dbResult => {
            const viralChannels12wCount = dbResult[0][0]?.viral_channels_count || 0;
            console.log('Viral channels (12 weeks):', viralChannels12wCount);
            res.status(200).send({ viralChannels12wCount });
        })
        .catch(err => {
            console.log(`ERROR: ${err}`);
            res.status(400).send(err);
        });
    }
};
