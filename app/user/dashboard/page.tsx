'use client';
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