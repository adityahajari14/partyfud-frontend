'use client';
import { useEffect } from 'react';
import Plan from '../Plan';
import Hero from '../Hero';
import Occasions from '../Occasions';
import Package from '../Package';
import PackageTypes from '../PackageTypes';
import Caterers from '../Caterers';
import Categories from '../Categories';
import Partner from '../Partner';
import Testimonials from '../Testimonials';

export default function Dashboard() {
    useEffect(() => {
        // Handle hash navigation on mount and when hash changes
        const handleHash = () => {
            if (window.location.hash === '#partner') {
                const partnerSection = document.getElementById('partner');
                if (partnerSection) {
                    setTimeout(() => {
                        partnerSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        };

        handleHash();
        window.addEventListener('hashchange', handleHash);
        
        return () => {
            window.removeEventListener('hashchange', handleHash);
        };
    }, []);

    return (
        <>
        <Hero/>
        <Plan/>
        {/* <Occasions/> */}
        <PackageTypes/>
        <Package/>
        <Caterers/>
        <Categories/>
        <Partner/>
        <Testimonials/>
        </>
    );
}